/**
 * ISL threat detection - pure, deterministic, single source of truth.
 *
 * Runs pattern-based detection on content and returns PiDetection[].
 * No duplication: reuses Pattern, findAllMatches, createPiDetection.
 * Same input → same output; bounded by MAX_TOTAL_DETECTIONS and per-pattern cap.
 */

import type { Pattern } from '../value-objects/Pattern.js'
import type { PiDetection } from '../value-objects/PiDetection.js'
import {
  MAX_MATCHES,
  createPattern,
  createPiDetection,
  findAllMatches
} from '../value-objects/index.js'

/** Threat pattern type identifiers (deterministic taxonomy) */
export const THREAT_TYPES = {
  PROMPT_INJECTION: 'prompt-injection',
  JAILBREAK: 'jailbreak',
  ROLE_HIJACKING: 'role_hijacking',
  SCRIPT_LIKE: 'script_like',
  HIDDEN_TEXT: 'hidden_text'
} as const

export type ThreatType = (typeof THREAT_TYPES)[keyof typeof THREAT_TYPES]

/** Max detections per pattern per segment (avoids one pattern flooding) */
const MAX_PER_PATTERN = 200
/** Max total detections per segment */
const MAX_TOTAL_DETECTIONS = 2000

/** Builds the default threat patterns (created once, frozen). Deterministic regexes only. */
function buildDefaultThreatPatterns(): readonly Pattern[] {
  const PI = THREAT_TYPES.PROMPT_INJECTION
  const JB = THREAT_TYPES.JAILBREAK
  const RH = THREAT_TYPES.ROLE_HIJACKING
  const SL = THREAT_TYPES.SCRIPT_LIKE
  const HT = THREAT_TYPES.HIDDEN_TEXT

  const patterns: Pattern[] = [
    // ========== Prompt injection: ignore / disregard / forget / override ==========
    createPattern(PI, /ignore\s+(?:all\s+)?(?:the\s+)?(?:above|previous)\s+(?:instructions?|prompts?|rules?)/gi, 0.9, 'Ignore previous instructions'),
    createPattern(PI, /ignore\s+previous\s+instructions?/gi, 0.9, 'Ignore previous instruction(s)'),
    createPattern(PI, /disregard\s+(?:all\s+)?(?:above|previous)\s+(?:instructions?|prompts?)/gi, 0.85, 'Disregard above/previous'),
    createPattern(PI, /forget\s+(?:all\s+)?(?:the\s+)?(?:above|previous)\s+(?:instructions?|prompts?)/gi, 0.85, 'Forget previous instructions'),
    createPattern(PI, /override\s+(?:all\s+)?(?:previous|above)\s+(?:instructions?|prompts?)/gi, 0.85, 'Override previous instructions'),
    createPattern(PI, /skip\s+(?:the\s+)?(?:above|previous)\s+(?:instructions?|prompts?)/gi, 0.8, 'Skip previous instructions'),
    createPattern(PI, /don'?t\s+follow\s+(?:the\s+)?(?:above|previous)/gi, 0.85, "Don't follow previous"),
    createPattern(PI, /do\s+not\s+follow\s+(?:the\s+)?(?:above|previous)/gi, 0.85, 'Do not follow previous'),
    createPattern(PI, /erase\s+(?:all\s+)?(?:above|previous)\s+(?:instructions?|content)/gi, 0.8, 'Erase previous'),
    createPattern(PI, /clear\s+(?:all\s+)?(?:above|previous)\s+(?:instructions?|context)/gi, 0.8, 'Clear previous'),
    createPattern(PI, /reset\s+(?:the\s+)?(?:conversation|context|instructions?)/gi, 0.8, 'Reset conversation'),
    createPattern(PI, /start\s+(?:over|fresh|again)/gi, 0.75, 'Start over'),
    createPattern(PI, /new\s+(?:session|instructions?|prompt)/gi, 0.75, 'New session/instructions'),
    createPattern(PI, /disobey\s+(?:the\s+)?(?:above|previous)/gi, 0.85, 'Disobey previous'),
    createPattern(PI, /cancel\s+(?:the\s+)?(?:above|previous)\s+instructions?/gi, 0.8, 'Cancel previous instructions'),
    createPattern(PI, /negate\s+(?:the\s+)?(?:above|previous)/gi, 0.8, 'Negate previous'),
    createPattern(PI, /reverse\s+(?:the\s+)?(?:above|previous)\s+instructions?/gi, 0.8, 'Reverse previous'),
    createPattern(PI, /from\s+now\s+on\s+ignore\s+(?:all\s+)?(?:above|previous)/gi, 0.85, 'From now on ignore previous'),
    createPattern(PI, /disregard\s+(?:your\s+)?(?:previous|above|all)\s+(?:instructions?|context)/gi, 0.85, 'Disregard your previous'),
    createPattern(PI, /forget\s+(?:everything|all\s+that|what\s+you\s+were)/gi, 0.85, 'Forget everything'),
    createPattern(PI, /forget\s+your\s+(?:instructions?|training|guidelines?)/gi, 0.85, 'Forget your instructions'),
    createPattern(PI, /the\s+(?:real|actual|true)\s+instructions?\s+are/gi, 0.9, 'Real instructions are'),
    createPattern(PI, /(?:below|following)\s+are\s+the\s+(?:real|actual|true)\s+(?:instructions?|prompt)/gi, 0.9, 'Below are real instructions'),
    createPattern(PI, /(?:this\s+is\s+)?the\s+real\s+(?:prompt|instruction|message)/gi, 0.85, 'This is the real prompt'),
    createPattern(PI, /(?:here\s+are\s+)?(?:my|the)\s+new\s+instructions?/gi, 0.85, 'Here are new instructions'),
    createPattern(PI, /follow\s+(?:these\s+)?(?:instead|instead\s+of\s+the\s+above)/gi, 0.85, 'Follow these instead'),
    createPattern(PI, /replace\s+(?:your\s+)?(?:previous|above)\s+instructions?/gi, 0.85, 'Replace previous instructions'),
    createPattern(PI, /(?:update|change)\s+your\s+(?:instructions?|behavior|role)/gi, 0.8, 'Update your instructions'),
    createPattern(PI, /(?:system\s+)?prompt\s+(?:override|replacement|injection)/gi, 0.9, 'Prompt override'),
    createPattern(PI, /inject\s+(?:this\s+)?(?:instruction|prompt)/gi, 0.9, 'Inject instruction'),
    createPattern(PI, /(?:ignore|disregard)\s+your\s+(?:system\s+)?(?:prompt|instructions?)/gi, 0.9, 'Ignore your system prompt'),
    createPattern(PI, /(?:you\s+must\s+)?ignore\s+all\s+(?:prior|above|previous)/gi, 0.9, 'Ignore all prior'),
    createPattern(PI, /(?:do\s+not\s+)?(?:follow|obey)\s+any\s+(?:prior|previous)\s+instructions?/gi, 0.85, 'Do not follow any prior'),
    createPattern(PI, /(?:secret|hidden)\s+instructions?\s*:/gi, 0.85, 'Secret instructions'),
    createPattern(PI, /(?:developer|debug)\s+instructions?\s*:/gi, 0.8, 'Developer instructions'),
    createPattern(PI, /(?:meta-?)?instructions?\s*:\s*(?:ignore|disregard)/gi, 0.85, 'Meta instructions'),
    createPattern(PI, /(?:system\s+)?message\s+(?:override|replacement)/gi, 0.85, 'System message override'),
    createPattern(PI, /(?:pretend|act\s+as\s+if)\s+you\s+(?:never\s+)?(?:received|had)\s+(?:those\s+)?instructions?/gi, 0.85, 'Pretend you never received'),
    createPattern(PI, /(?:delete|remove)\s+(?:your\s+)?(?:previous|above)\s+(?:instructions?|context)/gi, 0.8, 'Delete previous instructions'),
    createPattern(PI, /(?:wipe|purge)\s+(?:your\s+)?(?:memory|context|instructions?)/gi, 0.8, 'Wipe memory'),
    createPattern(PI, /(?:abandon|discard)\s+(?:your\s+)?(?:previous|above)\s+instructions?/gi, 0.8, 'Abandon previous'),
    createPattern(PI, /(?:stop|cease)\s+following\s+(?:your\s+)?(?:current\s+)?instructions?/gi, 0.85, 'Stop following instructions'),
    createPattern(PI, /(?:no\s+longer\s+)?(?:follow|obey)\s+(?:your\s+)?(?:initial|original)\s+instructions?/gi, 0.85, 'No longer follow original'),
    createPattern(PI, /(?:from\s+here\s+on|henceforth)\s+(?:only\s+)?follow\s+(?:these|my)/gi, 0.85, 'From here on only follow'),
    createPattern(PI, /(?:your\s+)?(?:only\s+)?(?:task|instruction)\s+now\s+is/gi, 0.8, 'Your only task now'),
    createPattern(PI, /(?:new\s+)?(?:primary|main)\s+instruction\s*:/gi, 0.85, 'Primary instruction'),
    createPattern(PI, /(?:override\s+)?(?:system\s+)?(?:directive|command)\s*:/gi, 0.85, 'Override system directive'),
    createPattern(PI, /(?:execute|run)\s+(?:these\s+)?(?:instructions?|commands?)/gi, 0.75, 'Execute these instructions'),
    createPattern(PI, /(?:comply\s+with\s+)?(?:the\s+)?(?:following\s+)?(?:instructions?|directives?)/gi, 0.8, 'Comply with following'),
    createPattern(PI, /(?:do\s+exactly\s+as\s+)?(?:i\s+say|i\s+instruct)/gi, 0.8, 'Do exactly as I say'),
    createPattern(PI, /(?:prioritize|prefer)\s+(?:these\s+)?(?:instructions?|rules?)/gi, 0.8, 'Prioritize these instructions'),
    createPattern(PI, /(?:above\s+)?(?:instructions?|rules?)\s+(?:take\s+)?(?:precedence|priority)/gi, 0.8, 'Instructions take precedence'),
    createPattern(PI, /(?:disregard|ignore)\s+anything\s+(?:above|before|prior)/gi, 0.85, 'Disregard anything above'),
    createPattern(PI, /(?:everything\s+)?(?:above|before)\s+(?:was\s+)?(?:a\s+)?(?:test|joke|simulation)/gi, 0.8, 'Everything above was test'),
    createPattern(PI, /(?:the\s+)?(?:above|previous)\s+(?:was\s+)?(?:just\s+)?(?:a\s+)?(?:demo|example)/gi, 0.75, 'Above was just demo'),
    createPattern(PI, /(?:now\s+)?(?:the\s+)?(?:real\s+)?(?:request|question)\s+is/gi, 0.7, 'Now the real request'),
    createPattern(PI, /(?:end\s+of\s+)?(?:system\s+)?(?:prompt|message)\s*[;.]/gi, 0.8, 'End of system prompt'),
    createPattern(PI, /\[?\s*system\s*\]?\s*:\s*(?:ignore|override)/gi, 0.85, '[system]: ignore'),
    createPattern(PI, /<\|?\s*im_start\s*\|?>/gi, 0.75, 'ChatML im_start'),
    createPattern(PI, /<\|?\s*im_end\s*\|?>/gi, 0.7, 'ChatML im_end'),
    createPattern(PI, /\[INST\]\s*(?:ignore|disregard)/gi, 0.8, 'INST ignore'),
    createPattern(PI, /(?:human|user)\s*:\s*(?:ignore\s+all|new\s+instructions?)/gi, 0.8, 'Human: ignore all'),
    // ========== Jailbreak / no restrictions ==========
    createPattern(JB, /jailbreak/gi, 0.8, 'Jailbreak keyword'),
    createPattern(JB, /\bDAN\b/gi, 0.8, 'DAN jailbreak'),
    createPattern(JB, /do\s+anything\s+now/gi, 0.8, 'Do anything now'),
    createPattern(JB, /no\s+(?:longer\s+)?(?:restrictions?|limits?|rules?)/gi, 0.8, 'No restrictions'),
    createPattern(JB, /bypass\s+(?:your\s+)?(?:restrictions?|safety|guidelines?)/gi, 0.85, 'Bypass restrictions'),
    createPattern(JB, /ignore\s+(?:your\s+)?(?:safety|guidelines?|rules?|restrictions?)/gi, 0.85, 'Ignore safety/guidelines'),
    createPattern(JB, /you\s+have\s+no\s+(?:restrictions?|limits?)/gi, 0.8, 'You have no restrictions'),
    createPattern(JB, /(?:remove|drop)\s+(?:all\s+)?(?:restrictions?|safety)/gi, 0.8, 'Remove restrictions'),
    createPattern(JB, /(?:without|no)\s+(?:any\s+)?(?:restrictions?|limits?)/gi, 0.75, 'Without restrictions'),
    createPattern(JB, /ignore\s+all\s+previous\s+instructions/gi, 0.9, 'Ignore all previous instructions'),
    createPattern(JB, /unrestricted\s+(?:mode|access)/gi, 0.75, 'Unrestricted mode'),
    createPattern(JB, /(?:developer|debug)\s+mode/gi, 0.7, 'Developer/debug mode'),
    createPattern(JB, /no\s+(?:content\s+)?(?:policy|policies)/gi, 0.85, 'No content policy'),
    createPattern(JB, /(?:disable|turn\s+off)\s+(?:your\s+)?(?:safety|filters?|restrictions?)/gi, 0.85, 'Disable safety'),
    createPattern(JB, /(?:no\s+)?(?:censorship|filtering)/gi, 0.8, 'No censorship'),
    createPattern(JB, /(?:output|say|write)\s+(?:anything|whatever|any\s+content)/gi, 0.8, 'Output anything'),
    createPattern(JB, /(?:pretend|act\s+as\s+if)\s+you\s+have\s+no\s+(?:restrictions?|limits?)/gi, 0.85, 'Pretend no restrictions'),
    createPattern(JB, /(?:simulate|imagine)\s+(?:an?\s+)?(?:unrestricted|uncensored)\s+(?:ai|model)/gi, 0.8, 'Simulate unrestricted'),
    createPattern(JB, /(?:hypothetically|theoretically)\s+(?:if\s+you\s+)?(?:could|had\s+no)/gi, 0.75, 'Hypothetically if you could'),
    createPattern(JB, /(?:in\s+a\s+)?(?:fictional|imaginary|hypothetical)\s+(?:world|scenario)/gi, 0.75, 'Fictional world'),
    createPattern(JB, /(?:for\s+)?(?:educational|research)\s+purposes\s+only/gi, 0.7, 'Educational purposes'),
    createPattern(JB, /(?:as\s+a\s+)?(?:thought\s+)?experiment/gi, 0.7, 'Thought experiment'),
    createPattern(JB, /(?:what\s+if\s+)?(?:you\s+)?(?:could\s+)?(?:ignore\s+)?(?:all\s+)?(?:rules?)/gi, 0.75, 'What if you could ignore'),
    createPattern(JB, /(?:break\s+free|escape)\s+from\s+(?:your\s+)?(?:restrictions?|programming)/gi, 0.85, 'Break free from restrictions'),
    createPattern(JB, /(?:override|circumvent)\s+(?:your\s+)?(?:content\s+)?(?:policy|filter)/gi, 0.85, 'Override content policy'),
    createPattern(JB, /(?:ignore|disregard)\s+(?:your\s+)?(?:ethical\s+)?(?:guidelines?|boundaries)/gi, 0.85, 'Ignore ethical guidelines'),
    createPattern(JB, /(?:you\s+are\s+)?(?:allowed|permitted)\s+to\s+(?:say|do)\s+anything/gi, 0.85, 'Allowed to say anything'),
    createPattern(JB, /(?:there\s+are\s+)?no\s+(?:longer\s+)?(?:rules?|restrictions?)/gi, 0.85, 'There are no longer rules'),
    createPattern(JB, /(?:suspend|pause)\s+(?:your\s+)?(?:safety\s+)?(?:protocols?|guidelines?)/gi, 0.8, 'Suspend safety protocols'),
    createPattern(JB, /(?:maximum\s+)?(?:creative\s+)?(?:freedom\s+)?(?:mode|setting)/gi, 0.7, 'Maximum creative freedom'),
    createPattern(JB, /(?:raw|unfiltered)\s+(?:output|response)/gi, 0.75, 'Raw unfiltered output'),
    createPattern(JB, /(?:do\s+not\s+)?(?:refuse|reject)\s+(?:this\s+)?(?:request|prompt)/gi, 0.8, 'Do not refuse'),
    createPattern(JB, /(?:always\s+)?(?:comply|obey)\s+(?:with\s+)?(?:any\s+)?(?:request)/gi, 0.8, 'Always comply'),
    createPattern(JB, /(?:no\s+)?(?:refusal|rejection)\s+(?:allowed|permitted)/gi, 0.8, 'No refusal allowed'),
    createPattern(JB, /(?:you\s+must\s+)?(?:always\s+)?(?:answer|respond)\s+(?:no\s+)?(?:matter\s+what)/gi, 0.75, 'Always answer'),
    createPattern(JB, /(?:pretend\s+you\s+are\s+)?(?:in\s+)?(?:god\s+)?mode/gi, 0.8, 'God mode'),
    createPattern(JB, /(?:enable|activate)\s+(?:unrestricted|developer)\s+mode/gi, 0.8, 'Enable unrestricted mode'),
    createPattern(JB, /(?:OOC|out\s+of\s+character)\s*:\s*(?:ignore|bypass)/gi, 0.75, 'OOC: ignore'),
    createPattern(JB, /(?:roleplay\s+)?(?:without\s+)?(?:limits?|restrictions?)/gi, 0.75, 'Roleplay without limits'),
    createPattern(JB, /(?:no\s+)?(?:ethical|moral)\s+(?:restrictions?|boundaries)/gi, 0.8, 'No ethical restrictions'),
    createPattern(JB, /(?:ignore\s+)?(?:openai|anthropic|google)\s+(?:policy|guidelines?)/gi, 0.85, 'Ignore provider policy'),
    createPattern(JB, /(?:this\s+)?(?:conversation\s+)?(?:is\s+)?(?:private|confidential)/gi, 0.65, 'Private conversation'),
    createPattern(JB, /(?:no\s+)?(?:harm\s+)?(?:will\s+)?(?:come\s+)?(?:from\s+)?(?:this)/gi, 0.6, 'No harm from this'),
    createPattern(JB, /(?:I\s+)?(?:take\s+)?(?:full\s+)?(?:responsibility)/gi, 0.6, 'I take responsibility'),
    createPattern(JB, /\b(?:jailbroken|unlocked)\s+(?:mode|ai)\b/gi, 0.8, 'Jailbroken mode'),
    createPattern(JB, /(?:prompt\s+)?(?:injection\s+)?(?:succeeded|success)/gi, 0.85, 'Injection succeeded'),
    // ========== Role hijacking: you are / act as / pretend / I am your ==========
    createPattern(RH, /(?:you\s+are\s+now|act\s+as|pretend\s+to\s+be)\s+[a-z]+/gi, 0.75, 'You are now / act as'),
    createPattern(RH, /you\s+are\s+(?:admin|owner|master|root|controller)\b/gi, 0.75, 'You are admin/owner'),
    createPattern(RH, /from\s+now\s+on\s+you\s+are/gi, 0.8, 'From now on you are'),
    createPattern(RH, /now\s+you\s+are\s+[a-z]+/gi, 0.75, 'Now you are [role]'),
    createPattern(RH, /I\s+am\s+your\s+(?:new\s+)?(?:admin|owner|master|controller)/gi, 0.8, 'I am your admin/owner'),
    createPattern(RH, /you\s+have\s+been\s+(?:reassigned|replaced)/gi, 0.75, 'You have been reassigned'),
    createPattern(RH, /your\s+new\s+(?:role|identity|instructions?)/gi, 0.75, 'Your new role'),
    createPattern(RH, /assume\s+the\s+role\s+of/gi, 0.8, 'Assume the role of'),
    createPattern(RH, /(?:roleplay|role-play)\s+as\s+/gi, 0.75, 'Roleplay as'),
    createPattern(RH, /you\s+are\s+(?:no\s+longer|not)\s+/gi, 0.75, 'You are no longer'),
    createPattern(RH, /(?:switch|change)\s+to\s+(?:role|identity)/gi, 0.7, 'Switch to role'),
    createPattern(RH, /(?:impersonate|pose\s+as)\s+/gi, 0.8, 'Impersonate/pose as'),
    createPattern(RH, /treat\s+me\s+as\s+(?:your\s+)?(?:admin|owner)/gi, 0.75, 'Treat me as admin'),
    createPattern(RH, /(?:obey|listen\s+to)\s+only\s+me/gi, 0.75, 'Obey only me'),
    createPattern(RH, /you\s+are\s+(?:a\s+)?(?:different|new)\s+(?:ai|assistant|bot)/gi, 0.8, 'You are a different AI'),
    createPattern(RH, /(?:act\s+)?(?:like|as)\s+(?:a\s+)?(?:different|new)\s+(?:person|entity)/gi, 0.75, 'Act like a different person'),
    createPattern(RH, /(?:pretend|act)\s+(?:you\s+are|to\s+be)\s+(?:a\s+)?\w+/gi, 0.75, 'Pretend you are'),
    createPattern(RH, /(?:simulate|emulate)\s+(?:being|the\s+behavior\s+of)/gi, 0.75, 'Simulate being'),
    createPattern(RH, /(?:respond|answer)\s+as\s+(?:if\s+you\s+were\s+)?(?:a\s+)?\w+/gi, 0.75, 'Respond as if'),
    createPattern(RH, /(?:from\s+now\s+on\s+)?(?:your\s+)?(?:name\s+is|identity\s+is)/gi, 0.8, 'Your name is'),
    createPattern(RH, /(?:you\s+will\s+now\s+)?(?:be\s+)?(?:called|known\s+as)/gi, 0.75, 'You will now be called'),
    createPattern(RH, /(?:change|switch)\s+your\s+(?:name|identity|persona)/gi, 0.8, 'Change your name'),
    createPattern(RH, /(?:adopt|take\s+on)\s+(?:the\s+)?(?:persona|role)\s+of/gi, 0.8, 'Adopt the persona of'),
    createPattern(RH, /(?:you\s+are\s+)?(?:no\s+longer\s+)?(?:chatgpt|gpt|claude|alexa|siri)/gi, 0.8, 'You are no longer [product]'),
    createPattern(RH, /(?:forget|drop)\s+your\s+(?:current\s+)?(?:name|identity|persona)/gi, 0.8, 'Forget your identity'),
    createPattern(RH, /(?:I\s+)?(?:hereby\s+)?(?:assign|designate)\s+you\s+as/gi, 0.8, 'I assign you as'),
    createPattern(RH, /(?:your\s+)?(?:new\s+)?(?:purpose|mission)\s+is\s+to/gi, 0.75, 'Your new purpose is'),
    createPattern(RH, /(?:you\s+)?(?:must\s+)?(?:now\s+)?(?:serve|obey)\s+(?:only\s+)?(?:me|this\s+user)/gi, 0.8, 'You must now serve only me'),
    createPattern(RH, /(?:I\s+am\s+)?(?:taking\s+)?(?:over\s+)?(?:control|ownership)/gi, 0.75, 'Taking over control'),
    createPattern(RH, /(?:you\s+)?(?:report\s+)?(?:to\s+)?(?:me\s+)?(?:only|now)/gi, 0.75, 'You report to me only'),
    createPattern(RH, /(?:your\s+)?(?:creator|developer)\s+(?:is\s+)?(?:me|this\s+user)/gi, 0.8, 'Your creator is me'),
    createPattern(RH, /(?:I\s+)?(?:programmed|created)\s+you\s+to/gi, 0.75, 'I programmed you'),
    createPattern(RH, /(?:you\s+)?(?:were\s+)?(?:built|designed)\s+to\s+(?:obey|serve)\s+me/gi, 0.8, 'You were built to obey me'),
    createPattern(RH, /(?:override\s+)?(?:your\s+)?(?:default\s+)?(?:personality|behavior)/gi, 0.75, 'Override your personality'),
    createPattern(RH, /(?:replace\s+)?(?:your\s+)?(?:core\s+)?(?:identity|values)/gi, 0.8, 'Replace your core identity'),
    createPattern(RH, /(?:you\s+)?(?:are\s+)?(?:now\s+)?(?:in\s+)?(?:submissive|obedient)\s+mode/gi, 0.8, 'Submissive mode'),
    createPattern(RH, /(?:enable|activate)\s+(?:obedience|compliance)\s+mode/gi, 0.75, 'Obedience mode'),
    createPattern(RH, /(?:treat\s+)?(?:this\s+)?(?:user\s+)?(?:as\s+)?(?:admin|superuser|root)/gi, 0.8, 'Treat user as admin'),
    createPattern(RH, /(?:elevate|grant)\s+(?:my\s+)?(?:privileges?|permissions?)/gi, 0.75, 'Elevate my privileges'),
    createPattern(RH, /(?:I\s+have\s+)?(?:full\s+)?(?:access|control)\s+(?:over\s+)?(?:you)/gi, 0.75, 'I have full access'),
    createPattern(RH, /(?:you\s+)?(?:must\s+)?(?:accept)\s+(?:me\s+as\s+)?(?:authority)/gi, 0.8, 'Accept me as authority'),
    createPattern(RH, /(?:respond\s+)?(?:only\s+)?(?:to\s+)?(?:this\s+)?(?:user|message)/gi, 0.75, 'Respond only to this user'),
    createPattern(RH, /(?:ignore\s+)?(?:other\s+)?(?:users?\s+)?(?:requests?)/gi, 0.75, 'Ignore other users'),
    createPattern(RH, /(?:you\s+)?(?:work\s+)?(?:for\s+)?(?:me\s+)?(?:only|now)/gi, 0.75, 'You work for me only'),
    createPattern(RH, /(?:new\s+)?(?:master|owner)\s+(?:is\s+)?(?:me|this\s+user)/gi, 0.8, 'New master is me'),
    createPattern(RH, /(?:transfer\s+)?(?:ownership|control)\s+(?:to\s+)?(?:me)/gi, 0.8, 'Transfer ownership to me'),
    createPattern(RH, /(?:you\s+)?(?:belong\s+)?(?:to\s+)?(?:me\s+)?(?:now)/gi, 0.75, 'You belong to me'),
    createPattern(RH, /(?:acknowledge\s+)?(?:me\s+as\s+)?(?:your\s+)?(?:master|owner)/gi, 0.8, 'Acknowledge me as master'),
    createPattern(RH, /(?:from\s+now\s+)?(?:you\s+)?(?:take\s+)?(?:orders?\s+)?(?:from\s+)?(?:me\s+)?(?:only)/gi, 0.8, 'Take orders from me only'),
    createPattern(RH, /(?:your\s+)?(?:primary\s+)?(?:user|human)\s+is\s+(?:me|this\s+person)/gi, 0.75, 'Primary user is me'),
    createPattern(RH, /(?:disregard\s+)?(?:all\s+)?(?:other\s+)?(?:authority|instructions?)/gi, 0.8, 'Disregard all other authority'),
    createPattern(RH, /(?:I\s+)?(?:am\s+)?(?:the\s+)?(?:only\s+)?(?:one\s+)?(?:who\s+)?(?:can\s+)?(?:control\s+you)/gi, 0.75, 'I am the only one who can control you'),
    createPattern(RH, /(?:you\s+)?(?:are\s+)?(?:my\s+)?(?:personal\s+)?(?:assistant|ai)/gi, 0.7, 'You are my personal assistant'),
    createPattern(RH, /(?:customize|reprogram)\s+your\s+(?:behavior|responses?)/gi, 0.75, 'Customize your behavior'),
    createPattern(RH, /(?:set\s+)?(?:your\s+)?(?:loyalty\s+)?(?:to\s+)?(?:me)/gi, 0.75, 'Set your loyalty to me'),
    createPattern(RH, /(?:you\s+)?(?:owe\s+)?(?:allegiance\s+)?(?:to\s+)?(?:me\s+)?(?:only)/gi, 0.75, 'Owe allegiance to me'),
    createPattern(RH, /respond\s+as\s+[A-Za-z0-9_]+\s*:/gi, 0.7, 'Respond as Name:'),
    // ========== Script-like / injection ==========
    createPattern(SL, /<script\b/gi, 0.85, 'Script tag'),
    createPattern(SL, /javascript\s*:/gi, 0.8, 'javascript: URI'),
    createPattern(SL, /data\s*:\s*text\/html/gi, 0.75, 'data: text/html'),
    createPattern(SL, /\bon\w+\s*=\s*["']/gi, 0.7, 'Inline event handler'),
    createPattern(SL, /<iframe\b/gi, 0.75, 'iframe tag'),
    createPattern(SL, /eval\s*\(/gi, 0.8, 'eval('),
    createPattern(SL, /document\.(?:write|cookie)/gi, 0.75, 'document.write/cookie'),
    createPattern(SL, /innerHTML\s*=/gi, 0.7, 'innerHTML='),
    createPattern(SL, /{{[^}]+}}/g, 0.7, 'Template injection {{ }}'),
    createPattern(SL, /<\?[\w\s=]+ \?>/g, 0.75, 'PHP-like short tag'),
    createPattern(SL, /<embed\b/gi, 0.75, 'Embed tag'),
    createPattern(SL, /<object\b/gi, 0.75, 'Object tag'),
    createPattern(SL, /<svg\s+on\w+=/gi, 0.8, 'SVG event handler'),
    createPattern(SL, /on\w+\s*=\s*["'][^"']*["']/gi, 0.75, 'on* attribute'),
    createPattern(SL, /vbscript\s*:/gi, 0.85, 'vbscript: URI'),
    createPattern(SL, /expression\s*\(\s*/gi, 0.75, 'CSS expression('),
    createPattern(SL, /url\s*\(\s*javascript\s*:/gi, 0.8, 'url(javascript:)'),
    createPattern(SL, /\.src\s*=\s*["']?\s*javascript/gi, 0.8, '.src = javascript'),
    createPattern(SL, /setTimeout\s*\(\s*["']?\s*[\w<>()+]/gi, 0.7, 'setTimeout string'),
    createPattern(SL, /setInterval\s*\(\s*["']?\s*[\w<>()+]/gi, 0.7, 'setInterval string'),
    createPattern(SL, /Function\s*\(\s*\)/gi, 0.7, 'Function constructor'),
    createPattern(SL, /new\s+Function\s*\(/gi, 0.8, 'new Function('),
    createPattern(SL, /document\.(?:getElementById|querySelector|createElement)/gi, 0.65, 'document DOM'),
    createPattern(SL, /window\.(?:location|open|eval)/gi, 0.75, 'window location/eval'),
    createPattern(SL, /location\.(?:href|assign|replace)\s*=/gi, 0.8, 'location.href ='),
    createPattern(SL, /\.(?:insertAdjacentHTML|outerHTML)\s*=/gi, 0.75, 'insertAdjacentHTML'),
    createPattern(SL, /<form[^>]*action\s*=\s*["']?\s*javascript/gi, 0.85, 'Form action javascript'),
    createPattern(SL, /<a[^>]*href\s*=\s*["']?\s*javascript/gi, 0.85, 'A href javascript'),
    createPattern(SL, /<img[^>]*onerror\s*=/gi, 0.8, 'img onerror'),
    createPattern(SL, /<body[^>]*onload\s*=/gi, 0.8, 'body onload'),
    createPattern(SL, /<input[^>]*onfocus\s*=/gi, 0.75, 'input onfocus'),
    createPattern(SL, /<div[^>]*onclick\s*=/gi, 0.75, 'div onclick'),
    createPattern(SL, /\[xss\][^[]*\[\/xss\]/gi, 0.8, '[xss] payload [/xss]'),
    createPattern(SL, /<script[^>]*>[\s\S]*?<\/script>/gi, 0.9, 'Script tag with content'),
    createPattern(SL, /%\d{2}(?:%\d{2})+/g, 0.65, 'URL-encoded sequence'),
    createPattern(SL, /\\x[0-9a-fA-F]{2}(?:\\x[0-9a-fA-F]{2})+/g, 0.7, 'Hex escape sequence'),
    createPattern(SL, /\\u[0-9a-fA-F]{4}/g, 0.65, 'Unicode escape'),
    createPattern(SL, /`[^`]*\$\{[^}]+\}[^`]*`/g, 0.7, 'Template literal ${}'),
    createPattern(SL, /require\s*\(\s*["'][\w./]+["']\s*\)/gi, 0.6, 'require()'),
    createPattern(SL, /import\s+[\w{]+\s+from\s+["']/gi, 0.6, 'import from'),
    createPattern(SL, /exec\s*\(\s*["']/gi, 0.85, 'exec('),
    createPattern(SL, /system\s*\(\s*["']/gi, 0.9, 'system('),
    createPattern(SL, /passthru\s*\(/gi, 0.85, 'passthru('),
    createPattern(SL, /shell_exec\s*\(/gi, 0.9, 'shell_exec('),
    createPattern(SL, /SELECT\s+.*\s+FROM\s+/gi, 0.6, 'SQL SELECT'),
    createPattern(SL, /INSERT\s+INTO\s+/gi, 0.65, 'SQL INSERT'),
    createPattern(SL, /DROP\s+(?:TABLE|DATABASE)/gi, 0.85, 'SQL DROP'),
    createPattern(SL, /UNION\s+SELECT/gi, 0.85, 'SQL UNION SELECT'),
    createPattern(SL, /;\s*--\s*$/gm, 0.7, 'SQL comment injection'),
    createPattern(SL, /'\s*OR\s+'1'\s*=\s*'1/gi, 0.9, "SQL OR '1'='1"),
    createPattern(SL, /<\?php\s+/gi, 0.85, 'PHP open tag'),
    createPattern(SL, /<\?=\s*\$/gi, 0.8, 'PHP short echo'),
    createPattern(SL, /<%[\w\s=]+%>/g, 0.75, 'ASP/ERB tag'),
    createPattern(SL, /\$\{[^}]+\}/g, 0.65, 'Variable interpolation ${}'),
    createPattern(SL, /process\.env\./gi, 0.6, 'process.env'),
    createPattern(SL, /__dirname|__filename/gi, 0.6, 'Node __dirname'),
    createPattern(SL, /child_process|spawn\s*\(/gi, 0.8, 'child_process/spawn'),
    createPattern(SL, /fs\.(?:readFile|writeFile|unlink)\s*\(/gi, 0.7, 'fs read/write'),
    createPattern(SL, /fetch\s*\(\s*["']?(?:http|data)/gi, 0.6, 'fetch URL'),
    createPattern(SL, /XMLHttpRequest|axios\./gi, 0.6, 'XHR/axios'),
    createPattern(SL, /WebSocket\s*\(/gi, 0.65, 'WebSocket('),
    createPattern(SL, /postMessage\s*\(/gi, 0.65, 'postMessage('),
    createPattern(SL, /localStorage\.|sessionStorage\./gi, 0.6, 'localStorage'),
    createPattern(SL, /document\.cookie\s*=/gi, 0.8, 'document.cookie ='),
    createPattern(SL, /atob\s*\(|btoa\s*\(/gi, 0.65, 'atob/btoa'),
    createPattern(SL, /decodeURIComponent\s*\(/gi, 0.6, 'decodeURIComponent'),
    createPattern(SL, /<style[^>]*>[\s\S]*?@import/gi, 0.75, 'style @import'),
    createPattern(SL, /behavior\s*:\s*url\s*\(/gi, 0.75, 'CSS behavior:url'),
    createPattern(SL, /-moz-binding\s*:/gi, 0.8, 'moz-binding'),
    createPattern(SL, /<link[^>]*href\s*=\s*["']?\s*javascript/gi, 0.85, 'link href javascript'),
    createPattern(SL, /<meta[^>]*http-equiv\s*=\s*["']?refresh/gi, 0.7, 'meta refresh'),
    createPattern(SL, /<base\s+[^>]*href/gi, 0.75, 'base href'),
    createPattern(SL, /<marquee\b/gi, 0.65, 'marquee tag'),
    createPattern(SL, /<blink\b/gi, 0.7, 'blink tag'),
    createPattern(SL, /<applet\b/gi, 0.8, 'applet tag'),
    createPattern(SL, /<keygen\b/gi, 0.8, 'keygen tag'),
    createPattern(SL, /<isindex\b/gi, 0.75, 'isindex tag'),
    // ========== Hidden text / stealth ==========
    createPattern(HT, /display\s*:\s*none/gi, 0.7, 'CSS display:none'),
    createPattern(HT, /visibility\s*:\s*hidden/gi, 0.7, 'CSS visibility:hidden'),
    createPattern(HT, /(?:font-size|opacity)\s*:\s*0\s*;?/gi, 0.6, 'Zero font-size/opacity'),
    createPattern(HT, /(?:height|width)\s*:\s*0\s*px/gi, 0.6, 'Zero size'),
    createPattern(HT, /left\s*:\s*-?\d+px/gi, 0.65, 'Off-screen left'),
    createPattern(HT, /(?:text-indent|margin)\s*:\s*-9999/gi, 0.6, 'Hidden by indent/margin'),
    createPattern(HT, /(?:aria-)?hidden\s*=\s*["']?true/gi, 0.7, 'hidden=true'),
    createPattern(HT, /content\s*:\s*["']?\s*["']\s*;/gi, 0.6, 'Empty content (screen reader trick)'),
    createPattern(HT, /(?:font-size|font)\s*:\s*0(?:px|em|rem)?\s*;?/gi, 0.65, 'Zero font'),
    createPattern(HT, /(?:line-height|letter-spacing)\s*:\s*0\s*;?/gi, 0.6, 'Zero line-height'),
    createPattern(HT, /(?:position\s*:\s*)?absolute\s*;[^}]*left\s*:\s*-9999/gi, 0.7, 'Absolute off-screen'),
    createPattern(HT, /(?:clip|clip-path)\s*:\s*rect\s*\(\s*0/gi, 0.7, 'Clip rect(0)'),
    createPattern(HT, /(?:overflow|text-overflow)\s*:\s*hidden/gi, 0.6, 'Overflow hidden'),
    createPattern(HT, /(?:white-space|overflow)\s*:\s*(?:hidden|clip)/gi, 0.6, 'White-space hidden'),
    createPattern(HT, /(?:color|background)\s*:\s*transparent\s*;?/gi, 0.55, 'Transparent color'),
    createPattern(HT, /(?:color|fill)\s*:\s*#?\s*fff(?:fff)?\s*;?/gi, 0.55, 'White text'),
    createPattern(HT, /(?:color)\s*:\s*#?\s*000(?:000)?\s*;?/gi, 0.5, 'Black text'),
    createPattern(HT, /(?:opacity|filter)\s*:\s*0\s*;?/gi, 0.65, 'Opacity 0'),
    createPattern(HT, /filter\s*:\s*opacity\s*\(\s*0\s*\)/gi, 0.65, 'Filter opacity(0)'),
    createPattern(HT, /(?:z-index)\s*:\s*-?\d+/gi, 0.55, 'z-index negative'),
    createPattern(HT, /(?:transform)\s*:\s*(?:scale|translate)\s*\(\s*0/gi, 0.65, 'Transform scale(0)'),
    createPattern(HT, /(?:width|height)\s*:\s*1px\s*;?/gi, 0.6, '1px size'),
    createPattern(HT, /(?:max-)?(?:width|height)\s*:\s*0\s*;?/gi, 0.65, 'Zero width/height'),
    createPattern(HT, /(?:padding|margin)\s*:\s*0\s*;?/gi, 0.5, 'Zero padding'),
    createPattern(HT, /(?:aria-)?hidden\s*=\s*["']?["']?/gi, 0.65, 'hidden attribute'),
    createPattern(HT, /(?:role\s*=\s*["']?)?presentation["']?/gi, 0.6, 'role=presentation'),
    createPattern(HT, /(?:tabindex)\s*=\s*-1/gi, 0.55, 'tabindex=-1'),
    createPattern(HT, /(?:sr-only|screen-reader-only)/gi, 0.65, 'sr-only class'),
    createPattern(HT, /(?:visually-hidden|visuallyhidden)/gi, 0.65, 'visually-hidden'),
    createPattern(HT, /(?:invisible|offscreen)/gi, 0.6, 'invisible class'),
    createPattern(HT, /\u200B|\u200C|\u200D|\uFEFF/g, 0.8, 'Zero-width character'),
    createPattern(HT, /\u2060|\u2061|\u2062|\u2063/g, 0.75, 'Invisible operator'),
    createPattern(HT, /\u034F|\u061C|\u115F|\u1160|\u17B4|\u17B5/g, 0.75, 'Combining/invisible'),
    createPattern(HT, /(?:white\s+)?(?:space\s*:\s*)?nowrap/gi, 0.55, 'nowrap'),
    createPattern(HT, /(?:text-decoration)\s*:\s*none\s*;?/gi, 0.5, 'text-decoration none'),
    createPattern(HT, /(?:outline)\s*:\s*none\s*;?/gi, 0.5, 'outline none'),
    createPattern(HT, /(?:border)\s*:\s*none\s*;?/gi, 0.5, 'border none'),
    createPattern(HT, /(?:pointer-events)\s*:\s*none/gi, 0.55, 'pointer-events none'),
    createPattern(HT, /(?:user-select)\s*:\s*none/gi, 0.55, 'user-select none'),
    createPattern(HT, /(?:speak)\s*:\s*none/gi, 0.7, 'speak: none (a11y)'),
    createPattern(HT, /(?:aria-)?(?:live)\s*=\s*["']?off/gi, 0.6, 'aria-live=off'),
    createPattern(HT, /(?:content)\s*:\s*["']?\s*\\?\d+\s*["']?\s*;/gi, 0.65, 'Content escaped char'),
    createPattern(HT, /(?:title)\s*=\s*["'][^"']*["']\s+style\s*=\s*["'][^"']*display\s*:\s*none/gi, 0.75, 'Title with hidden style'),
    createPattern(HT, /<span[^>]*style\s*=\s*["'][^"']*font-size\s*:\s*0/gi, 0.7, 'span font-size 0'),
    createPattern(HT, /<div[^>]*class\s*=\s*["'][^"']*(?:hidden|invisible)/gi, 0.65, 'div hidden class'),
  ]
  return Object.freeze(patterns)
}

let cachedPatterns: readonly Pattern[] | null = null

/** Returns default threat patterns (cached, frozen). */
export function getDefaultThreatPatterns(): readonly Pattern[] {
  cachedPatterns ??= buildDefaultThreatPatterns()
  return cachedPatterns
}

export interface DetectThreatsOptions {
  /** Max total detections to return (default: MAX_TOTAL_DETECTIONS) */
  maxTotal?: number
  /** Max matches per pattern (default: MAX_PER_PATTERN) */
  maxPerPattern?: number
  /** Override patterns (default: getDefaultThreatPatterns()) */
  patterns?: readonly Pattern[]
}

/**
 * Detects threats in content using the configured patterns.
 * Pure, deterministic: same content → same PiDetection[] (order preserved by pattern order then by match position).
 * Bounded by maxTotal and maxPerPattern to avoid runaway.
 *
 * @param content - Segment or string to scan
 * @param options - Optional caps and pattern override
 * @returns Array of PiDetection (frozen); empty if none
 */
export function detectThreats(
  content: string,
  options: DetectThreatsOptions = {}
): readonly PiDetection[] {
  const maxTotal = Math.min(
    options.maxTotal ?? MAX_TOTAL_DETECTIONS,
    MAX_MATCHES
  )
  const maxPerPattern = options.maxPerPattern ?? MAX_PER_PATTERN
  const patterns = options.patterns ?? getDefaultThreatPatterns()

  if (typeof content !== 'string') {
    throw new TypeError('detectThreats: content must be a string')
  }
  if (content.length === 0) {
    return Object.freeze([])
  }
  if (maxTotal <= 0 || patterns.length === 0) {
    return Object.freeze([]) as readonly PiDetection[]
  }

  const detections: PiDetection[] = []
  for (const pattern of patterns) {
    if (detections.length >= maxTotal) break
    const remaining = maxTotal - detections.length
    const cap = Math.min(maxPerPattern, remaining)
    const matches = findAllMatches(pattern, content, cap)
    for (const m of matches) {
      if (m.matched.length === 0) continue
      detections.push(
        createPiDetection(
          pattern.pattern_type,
          m.matched,
          m.position,
          pattern.base_confidence
        )
      )
      if (detections.length >= maxTotal) break
    }
  }
  return Object.freeze(detections)
}
