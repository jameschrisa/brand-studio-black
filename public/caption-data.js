/* Caption animation library for the Motion & captions tab. Plain script, no modules. */
(function () {
  var WBW = "Word-by-word", POP = "Pop & bounce", REV = "Reveal", KIN = "Kinetic",
      HIL = "Highlight & box", GLO = "Glow & texture", CRE = "Creator styles";

  function s(id, title, category, hint, prompt, enter, emphasis, exit, timing, easing, fx, words) {
    return {
      id: id, title: title, category: category, hint: hint, prompt: prompt,
      spec: { enter: enter, emphasis: emphasis, exit: exit, timing: timing, easing: easing },
      fx: fx, words: words
    };
  }

  window.CAPTION_LIB = { styles: [

    /* ---------- Word-by-word ---------- */
    s("karaoke-highlight", "Karaoke highlight", WBW,
      "The whole line sits dimmed and each word fills with the accent color as it is spoken. Good for tutorials and sing-along lines.",
      "Karaoke highlight. Text: a 1-2 line caption of 4-8 words in the caption font, centered in the lower third, every word visible from the start at 45% opacity in the base color. Motion: the word being spoken fills with the accent color and scales to 1.1 for 80 ms, then settles to 1.0 while staying filled, so the line fills left to right. Timing: each fill starts on the audio onset of that word, no extra stagger. Effect: a sing-along cue that keeps the eye moving across the line. End: the full line holds filled for 300 ms, then fades out in 120 ms as the next line replaces it.",
      "words dim at 45% opacity, spoken word fills accent and scales 1.0 to 1.1 to 1.0",
      "active word fill in the accent color",
      "line fades out in 120 ms",
      "80 ms fill per word, synced to speech onset, line holds 300 ms",
      "cubic-bezier(.2,.8,.2,1)", "karaoke", ["READ", "ALONG", "*WITH", "ME"]),

    s("word-pop", "Word-by-word pop", WBW,
      "Each word pops in on its own beat and stays. The default short-form look for fast talkers.",
      "Word-by-word pop. Text: 2-4 words per screen in the caption font, caps, centered in the middle third. Motion: each word scales from 0 to 1.15 to 1.0 and fades in as it is spoken, earlier words stay on screen. Timing: 140 ms between words, 160 ms per pop, locked to speech onsets. Effect: punchy and rhythmic, it mirrors the speaker's cadence. End: the group holds 400 ms after the last word, then all words scale to 0.9 and fade out in 150 ms.",
      "scale 0 to 1.15 to 1, opacity 0 to 1", "none", "scale to 0.9 and fade out in 150 ms",
      "160 ms pop per word, 140 ms stagger, group holds 400 ms",
      "cubic-bezier(.34,1.56,.64,1)", "wordpop", ["THIS", "CHANGES", "*EVERYTHING"]),

    s("single-word-punch", "Single-word punch", WBW,
      "One big word at a time, replaced on every beat. High energy, works for hype and hooks.",
      "Single-word punch. Text: one word at a time, caps, very large (about 18% of frame height), centered in the middle of the frame, no other words visible. Motion: each word snaps in from scale 1.7 to 0.95 to 1.0 and the previous word cuts out instantly. Timing: 250-400 ms per word, switch exactly on the audio onset, no overlap. Effect: relentless and urgent, like a hard cut on every syllable. End: the last word holds 300 ms and cuts out with no fade.",
      "scale 1.7 to 0.95 to 1.0, opacity 0 to 1 in 60 ms", "none", "hard cut when the next word arrives",
      "250-400 ms per word, switches on speech onset, last word holds 300 ms",
      "cubic-bezier(.2,.9,.3,1)", "punch", ["STOP", "*SCROLL", "NOW"]),

    s("active-word-box", "Active word box", WBW,
      "A rounded box slides to whichever word is being spoken. Clean, readable, popular for educational clips.",
      "Active word box. Text: a 1-2 line caption in the caption font, 3-6 words per line, sentence case, centered in the lower third. Motion: a rounded rectangle in the accent color (corner radius 0.3 em, padding 0.3 em sideways) sits behind the current word and slides to the next word in 120 ms, the word inside turns near black. Timing: the box moves on each word onset, no pause between words. Effect: a moving spotlight that guides reading. End: after the last word the box fades out in 100 ms and the line holds 300 ms before a 120 ms fade.",
      "box slides 14 px and scales 0.9 to 1.0 behind the spoken word", "active word turns near black on the accent box",
      "box fades in 100 ms, line fades in 120 ms", "120 ms box travel, follows speech onsets, line holds 300 ms",
      "cubic-bezier(.2,.9,.3,1)", "wordbox", ["KEEP", "*YOUR", "EYES", "HERE"]),

    s("color-sweep-fill", "Color sweep fill", WBW,
      "Each word fills with the accent color from left to right as a smooth wipe. Softer than karaoke, good for calm voiceover.",
      "Color sweep fill. Text: 2-4 words per line in the caption font, caps or sentence case, centered, all words visible in the base color. Motion: a hard-edged color wipe moves left to right across each word, turning it from the base color to the accent color. Timing: 320 ms between word starts, each wipe takes 650 ms, ending a little after the word is spoken. Effect: a continuous, flowing read. End: filled words hold 800 ms, then the line wipes back to the base color in 200 ms.",
      "base color to accent color, hard edge wipe left to right inside each word", "filled words stay in the accent color",
      "wipes back to the base color in 200 ms", "650 ms wipe per word, 320 ms stagger, holds 800 ms",
      "cubic-bezier(.5,0,.2,1)", "sweep", ["FEEL", "THE", "*SHIFT"]),

    s("emphasis-word-swap", "Emphasis word swap", WBW,
      "Supporting words stay dim while the key word flips in, changes color and grows. Good for stressing one idea per line.",
      "Emphasis word swap. Text: 3-4 words in the caption font, caps, centered, supporting words at 60% opacity in the base color. Motion: the key word first appears in the base color, flips out around the horizontal axis (rotateX 0 to -90 degrees in 120 ms), and flips back in the accent color at scale 1.2. Timing: supporting words fade up in 250 ms with 100 ms stagger, the key word flips at 1.0 s. Effect: the eye is told exactly which word matters. End: the line holds 600 ms and fades out in 150 ms.",
      "supporting words fade up 8 px, key word flips in on the X axis", "key word flips from base color to accent color and scales to 1.2",
      "fades out in 150 ms", "250 ms fade per word, 100 ms stagger, key flip at 1.0 s, holds 600 ms",
      "cubic-bezier(.45,0,.2,1)", "swap", ["IT'S", "NOT", "*LUCK"]),

    /* ---------- Pop & bounce ---------- */
    s("bounce-in", "Bounce in", POP,
      "Words jump up from below, overshoot and settle. Playful and upbeat, good for lifestyle and food.",
      "Bounce in. Text: 2-4 words in the caption font, caps, centered in the middle third. Motion: each word rises from 34 px below at scale 0.5, overshoots to 14 px above at scale 1.1, dips 5 px, then rests at its place. Timing: 120 ms stagger, each bounce takes 450 ms. Effect: bouncy and friendly. End: hold 500 ms, then fade out upward by 6 px in 150 ms.",
      "translateY 34 px to -14 px to 5 px to 0, scale 0.5 to 1.1 to 1", "none", "fade out and rise 6 px in 150 ms",
      "450 ms per word, 120 ms stagger, holds 500 ms", "cubic-bezier(.34,1.56,.64,1)", "bounce", ["JUMP", "*RIGHT", "IN"]),

    s("squash-stretch", "Squash and stretch", POP,
      "Words fall in stretched, flatten on landing and spring back like rubber. Cartoon energy, good for comedy and kids.",
      "Squash and stretch. Text: 2-3 words in the caption font, caps, centered, transform origin at the baseline. Motion: each word drops from 44 px above stretched tall (scale 0.65 wide, 1.5 high), lands squashed (1.35 wide, 0.65 high), then recovers through 0.9/1.14 and 1.05/0.95 to rest. Timing: 130 ms stagger, whole landing takes 650 ms. Effect: rubbery, cartoon physics. End: hold 600 ms, fade out in 150 ms.",
      "drop 44 px with scale 0.65x1.5, land at 1.35x0.65, settle to 1.0", "none", "fade out in 150 ms",
      "650 ms landing per word, 130 ms stagger, holds 600 ms", "cubic-bezier(.3,1.4,.5,1)", "squash", ["BOING", "*BOING", "BOING"]),

    s("zoom-punch-shake", "Zoom punch with shake", POP,
      "Words slam in from huge and shake on impact. Loud, good for shock lines and hard hooks.",
      "Zoom punch with shake. Text: 1-3 words in the caption font, caps, heavy weight, centered. Motion: each word starts at scale 2.4, slams down to 0.9 in 140 ms, then shakes for 250 ms with alternating offsets of 4 px and rotation of 2 degrees before it locks at scale 1.0. Timing: 150 ms stagger, 480 ms total per word. Effect: an impact hit, like a camera thump. End: hold 500 ms, cut out in 100 ms.",
      "scale 2.4 to 0.9 in 140 ms, then 250 ms shake of 4 px and 2 degrees", "none", "hard fade out in 100 ms",
      "480 ms per word, 150 ms stagger, holds 500 ms", "cubic-bezier(.2,.9,.3,1)", "shake", ["NO", "*WAY", "HE", "DID"]),

    s("stagger-rise-blur", "Stagger rise with blur", POP,
      "Words drift up out of a soft blur one after another. Smooth and modern, good for product and brand videos.",
      "Stagger rise with blur. Text: 3-6 words in the caption font, sentence case, centered. Motion: each word rises 20 px while a 9 px blur resolves to 0 and opacity goes from 0 to 1. Timing: 95 ms stagger, 380 ms per word. Effect: calm and polished. End: hold 700 ms, then words lift 8 px and blur 6 px while fading out over 250 ms.",
      "translateY 20 px to 0, blur 9 px to 0, opacity 0 to 1", "none", "lift 8 px, blur 6 px, fade out in 250 ms",
      "380 ms per word, 95 ms stagger, holds 700 ms", "cubic-bezier(.2,.8,.2,1)", "riseblur", ["Built", "to", "*last"]),

    s("drop-in", "Drop in", POP,
      "Words fall from above, hit their spot and bounce once. Simple and satisfying, good for list items and punchlines.",
      "Drop in. Text: 2-4 words in the caption font, caps, centered. Motion: each word falls 70 px with gravity-style acceleration, lands, rebounds up 7 px and settles. Timing: 130 ms stagger, 400 ms fall, 200 ms rebound. Effect: weighty and certain. End: hold 600 ms and fade out in 150 ms.",
      "translateY -70 px to 0, one 7 px rebound, opacity 0 to 1", "none", "fade out in 150 ms",
      "400 ms fall plus 200 ms rebound, 130 ms stagger, holds 600 ms", "cubic-bezier(.5,0,1,.6) then ease-out", "drop", ["DROP", "THE", "*BASS"]),

    s("idle-wiggle", "Idle wiggle", POP,
      "Words pop in, then keep a small playful wobble while they hold. Keeps long captions alive.",
      "Idle wiggle. Text: 2-4 words in the caption font, caps, centered. Motion: each word pops in at scale 0.7 to 1.05 to 1.0, then rocks between -3.5 and 3.5 degrees with a 2 px lift for the rest of its time on screen. Timing: 160 ms stagger, pop 300 ms, wobble cycle 600 ms. Effect: lively and a little goofy, text never sits dead still. End: wobble settles to 0 degrees, then fade out in 150 ms.",
      "scale 0.7 to 1.05 to 1.0, opacity 0 to 1", "continuous wobble of 3.5 degrees on all words",
      "wobble settles, fade out in 150 ms", "300 ms pop, 600 ms wobble cycle, 160 ms stagger",
      "ease-in-out", "wiggle", ["SO", "*MUCH", "ENERGY"]),

    /* ---------- Reveal ---------- */
    s("mask-wipe-up", "Mask wipe up", REV,
      "Each word is revealed from a line, rising out of an invisible mask. Editorial and clean.",
      "Mask wipe up. Text: 2-5 words in the caption font, sentence case or caps, centered. Motion: each word moves up 45% of its height while a clip mask opens from the bottom edge, so the letters appear to rise out of a floor line. Timing: 130 ms stagger, 430 ms per word. Effect: sharp and designed. End: hold 700 ms, then the mask closes upward with a 45% rise in 200 ms.",
      "clip-path inset 100% to 0 from the bottom, translateY 45% to 0", "none", "mask closes upward with a 45% rise in 200 ms",
      "430 ms per word, 130 ms stagger, holds 700 ms", "cubic-bezier(.2,.9,.2,1)", "maskup", ["Made", "to", "*move"]),

    s("typewriter-cursor", "Typewriter with cursor", REV,
      "Letters appear in steps with a blinking cursor. Good for tech, quotes and anything that should feel typed.",
      "Typewriter with cursor. Text: 1-2 lines in the caption font or a monospace font, sentence case, left or center aligned. Motion: characters appear one by one in hard steps, a 2 px wide cursor in the accent color follows the last character and blinks at 2 Hz after typing ends. Timing: 35 ms per character, a 150 ms pause after punctuation. Effect: deliberate and machine-like. End: the cursor blinks twice, then the whole line deletes backward in 300 ms.",
      "clip reveal in 7 hard steps per word, cursor at the edge", "cursor in the accent color",
      "line deletes backward in 300 ms", "35 ms per character, 150 ms pause after punctuation, cursor blinks at 2 Hz",
      "steps(7, end)", "type", ["TYPED", "IN", "*REAL", "TIME"]),

    s("blur-to-focus", "Blur-to-focus", REV,
      "Words start as a heavy blur and snap into sharp focus. Cinematic, good for trailers and emotional lines.",
      "Blur-to-focus. Text: 2-5 words in the caption font, sentence case, centered, slightly letter-spaced. Motion: each word starts at 14 px blur and scale 1.2, then pulls into sharp focus at scale 1.0. Timing: 140 ms stagger, 520 ms per word. Effect: a camera pulling focus onto the line. End: hold 800 ms, then blur out to 10 px while fading in 250 ms.",
      "blur 14 px to 0, scale 1.2 to 1.0, opacity 0 to 1", "none", "blur to 10 px and fade out in 250 ms",
      "520 ms per word, 140 ms stagger, holds 800 ms", "cubic-bezier(.2,.8,.2,1)", "blurfocus", ["Then", "everything", "*changed"]),

    s("slide-in-side", "Slide in from side", REV,
      "Words enter from alternating sides and lock into one line. Simple and readable, good for lists and steps.",
      "Slide in from side. Text: 2-4 words in the caption font, caps, centered. Motion: odd words slide in from 60 px left, even words from 60 px right, both fading in as they land. Timing: 150 ms stagger, 400 ms per slide. Effect: orderly and fast. End: hold 600 ms, then odd words exit 30 px right and even words 30 px left in 200 ms.",
      "translateX +/-60 px to 0, opacity 0 to 1, alternating sides", "none", "slide 30 px to the opposite side and fade in 200 ms",
      "400 ms per word, 150 ms stagger, holds 600 ms", "cubic-bezier(.2,.9,.2,1)", "slide", ["LEFT", "AND", "*RIGHT"]),

    s("letter-scatter", "Letter scatter assemble", REV,
      "Pieces fly in from scattered positions and snap together into the caption. Playful, good for titles and reveals.",
      "Letter scatter assemble. Text: a short title of 2-4 words in the caption font, caps, centered. Motion: each letter starts 20-36 px off its spot at a random rotation of up to 25 degrees, scale 0.6 and 4 px blur, then flies to its place. Timing: 20 ms between letters, total assembly 600 ms. Effect: scattered chaos resolves into order. End: hold 700 ms, then letters scatter back out in 250 ms.",
      "offset 20-36 px, rotate up to 25 degrees, scale 0.6, blur 4 px to rest", "none", "letters scatter out in 250 ms",
      "600 ms total assembly, 20 ms per letter stagger, holds 700 ms", "cubic-bezier(.2,.9,.25,1)", "scatter", ["PUT", "IT", "*TOGETHER"]),

    s("line-by-line-rise", "Line-by-line rise", REV,
      "Whole lines rise into place one after another with a long soft ease. Good for subtitles and narration.",
      "Line-by-line rise. Text: 2-3 short lines in the caption font, sentence case, centered in the lower third. Motion: each line rises 44 px into place while fading in, no blur, no overshoot. Timing: 70 ms stagger between lines, 600 ms per rise. Effect: smooth and readable. End: hold 1 s, then lines lift 26 px and fade out in 250 ms.",
      "translateY 44 px to 0, opacity 0 to 1, long ease-out", "none", "lift 26 px and fade out in 250 ms",
      "600 ms per line, 70 ms stagger, holds 1 s", "cubic-bezier(.16,1,.3,1)", "linerise", ["A", "slower", "*kind", "of", "fast"]),

    s("scramble-decode", "Scramble decode", REV,
      "Text jitters through wrong letter spacing and skew before it resolves. Hacker and sci-fi feel.",
      "Scramble decode. Text: 1-3 words in the caption font or a monospace font, caps, centered. Motion: each word cycles through random characters and jittering letter spacing (0.5 em down to 0) with a skew of -18 to 20 degrees, flashing the accent color, then resolves to the correct text. Timing: 40 ms per scramble frame, about 8 frames per word, 200 ms stagger. Effect: decoding or hacking. End: hold 700 ms, then fade out in 120 ms.",
      "letter spacing 0.5 em to 0, skew 20 to -18 to 0 degrees in hard steps", "accent color flashes during the scramble and stays on the key word",
      "fade out in 120 ms", "40 ms per frame, 8 frames, 200 ms stagger, holds 700 ms",
      "steps(1, end)", "scramble", ["ACCESS", "*GRANTED"]),

    s("bar-wipe-reveal", "Bar wipe reveal", REV,
      "A solid bar sweeps across each word and uncovers it on the way out. Bold and broadcast-like, good for titles.",
      "Bar wipe reveal. Text: 2-3 words in the caption font, caps, centered. Motion: a bar in the accent color grows across each word from left to right, covers it, then exits to the right and uncovers the word. Timing: 220 ms stagger, bar in 290 ms, bar out 340 ms. Effect: a headline being unveiled. End: hold 700 ms and fade out in 150 ms.",
      "accent bar scaleX 0 to 1 from the left, then 1 to 0 toward the right", "none", "fade out in 150 ms",
      "290 ms bar in, 340 ms bar out, 220 ms stagger, holds 700 ms", "cubic-bezier(.7,0,.2,1)", "barwipe", ["BREAKING", "*NEWS", "TODAY"]),

    /* ---------- Kinetic ---------- */
    s("kinetic-stack-slam", "Kinetic stack slam", KIN,
      "Words of different sizes stack in a block and slam in one by one. Poster-like, good for statements and titles.",
      "Kinetic stack slam. Text: a stacked block of 3 lines in the caption font, caps, centered, line one at 0.9 em, line two at 1.8 em heavy weight, line three at 1.1 em, line height 0.95. Motion: each line slams in from scale 3.2 to 0.93 to 1.04 to 1.0. Timing: 170 ms stagger, 400 ms per slam. Effect: bold poster hierarchy with impact. End: hold 700 ms, then scale to 0.9 and fade out in 150 ms.",
      "scale 3.2 to 0.93 to 1.04 to 1.0, opacity 0 to 1", "the middle line is the largest and heaviest",
      "scale to 0.9 and fade out in 150 ms", "400 ms per slam, 170 ms stagger, holds 700 ms",
      "cubic-bezier(.2,.9,.3,1)", "slam", ["JUST", "*DO", "IT"]),

    s("flip-3d", "3D flip", KIN,
      "Words flip down from the top like a split-flap board. Mechanical and tidy.",
      "3D flip. Text: 2-4 words in the caption font, caps, centered, perspective 400 px, transform origin at the bottom edge. Motion: each word rotates from -95 degrees on the X axis to +14 degrees, then back to 0 with a slight overshoot. Timing: 130 ms stagger, 430 ms per flip. Effect: a physical flip board. End: hold 700 ms, then flip away to 90 degrees in 250 ms.",
      "rotateX -95 to 14 to 0 degrees, opacity 0 to 1", "none", "rotateX to 90 degrees in 250 ms",
      "430 ms per flip, 130 ms stagger, holds 700 ms", "cubic-bezier(.2,.8,.3,1)", "flip", ["FLIP", "THE", "*SCRIPT"]),

    s("spin-in", "Spin in", KIN,
      "Words spin in from nothing with a full turn and a small overshoot. Energetic, good for intros and transitions.",
      "Spin in. Text: 2-3 words in the caption font, caps, centered. Motion: each word scales from 0 to 1.12 while rotating from -270 degrees to +12 degrees, then settles to 0 degrees at scale 1.0. Timing: 140 ms stagger, 500 ms per spin. Effect: a whirl of energy. End: hold 600 ms, then spin out to +90 degrees and scale to 0 in 250 ms.",
      "rotate -270 to 12 to 0 degrees, scale 0 to 1.12 to 1", "none", "rotate to 90 degrees and scale to 0 in 250 ms",
      "500 ms per spin, 140 ms stagger, holds 600 ms", "cubic-bezier(.2,.9,.3,1.2)", "spin", ["ROUND", "AND", "*ROUND"]),

    s("letter-wave", "Letter wave", KIN,
      "A ripple travels across the words, lifting each in turn. Fun and musical, good for songs and upbeat clips.",
      "Letter wave. Text: 2-4 words in the caption font, caps, centered, fully visible from the start. Motion: a wave runs left to right, lifting each word 10 px and back, twice per cycle. Timing: 150 ms offset between words, 600 ms per wave, repeating for the length of the line. Effect: a rolling rhythm that never stops. End: the wave dies down over 300 ms and the line fades out in 150 ms.",
      "none, words are on screen at the start", "traveling lift of 10 px, two waves per cycle",
      "wave dies down in 300 ms, fade out in 150 ms", "600 ms per wave, 150 ms offset between words",
      "ease-in-out", "wave", ["RIDE", "THE", "*WAVE"]),

    s("zoom-through", "Zoom-through", KIN,
      "Words fly out of the distance, sit for a moment and then rush past the camera. Immersive, good for transitions.",
      "Zoom-through. Text: 1-3 words in the caption font, caps, centered. Motion: each word starts tiny (scale 0.25, 6 px blur) deep in the frame, flies to scale 1.0, drifts to 1.12, then rushes toward the camera to scale 5 while blurring to 8 px and fading out. Timing: 100 ms stagger, in 340 ms, drift 1.3 s, out 330 ms. Effect: flying through the text. End: the word leaves frame at scale 5.",
      "scale 0.25 to 1.0, blur 6 px to 0, opacity 0 to 1", "none", "scale 1.12 to 5, blur 8 px, opacity to 0 in 330 ms",
      "340 ms in, 1.3 s drift, 330 ms out, 100 ms stagger", "cubic-bezier(.3,.7,.3,1)", "zoomthru", ["INTO", "THE", "*FUTURE"]),

    s("rgb-glitch-shake", "RGB glitch shake", KIN,
      "Red and cyan channels split and jitter with slice cuts. Tech, horror and hype.",
      "RGB glitch shake. Text: 1-3 words in the caption font, caps, centered. Motion: the text carries a red and a cyan copy offset by 2 px, in two bursts (at the start and at the 50% mark) the offsets grow to 5 px, the word jumps 3-4 px and horizontal slices of the word are clipped for 40 ms steps. Timing: a burst lasts 300 ms, 60 ms stagger between words, steps of 40 ms. Effect: a corrupted signal. End: channels settle to 2 px and the line holds, then cuts out in 80 ms.",
      "hard steps of 4-5 px RGB split with slice clipping", "constant 2 px red and cyan fringe",
      "hard cut in 80 ms", "two 300 ms bursts per cycle, 40 ms steps, 60 ms stagger",
      "steps(1, end)", "glitch", ["SIGNAL", "*LOST"]),

    s("beat-pulse", "Beat pulse", KIN,
      "The whole caption pulses on every beat with a brightness kick. Pair with music to make the text feel part of the track.",
      "Beat pulse. Text: 2-4 words in the caption font, caps, centered, fully visible. Motion: the whole line scales to 1.15 and brightens by 30% on each beat, then eases back to 1.0 in 100 ms. Timing: pulse on every beat of the music, about 600 ms at 100 bpm, all words move together with no stagger. Effect: text that lives in the soundtrack. End: pulses continue until the line ends, then fade out in 150 ms.",
      "none, words are on screen at the start", "whole line pulses scale 1.0 to 1.15 and brightness +30%",
      "fade out in 150 ms", "pulse on each beat, 100 ms release, no stagger", "ease-out", "pulse", ["FEEL", "THE", "*BEAT"]),

    /* ---------- Highlight & box ---------- */
    s("marker-highlight-swipe", "Marker highlight swipe", HIL,
      "A highlighter swipes behind the key word. Reads like a student marking a book, good for key takeaways.",
      "Marker highlight swipe. Text: 3-5 words in the caption font, sentence case, centered, one key word. Motion: supporting words fade up 8 px, then a highlighter swipe in the accent color (tilted -1.5 degrees, extending 0.2 em past the word on each side) wipes left to right behind the key word, whose text turns near black. Timing: words fade in over 250 ms, swipe starts at 400 ms and runs 450 ms. Effect: reads as an underlined note. End: hold 800 ms, then fade out in 150 ms.",
      "supporting words fade up 8 px, highlighter scaleX 0 to 1 from the left", "accent highlighter behind the key word, text turns near black",
      "fade out in 150 ms", "250 ms fade, swipe at 400 ms for 450 ms, holds 800 ms", "cubic-bezier(.6,0,.2,1)", "marker", ["This", "is", "*important"]),

    s("sticker-label-box", "Sticker label box", HIL,
      "The key word sits on a tilted solid label that pops in like a sticker. Casual and loud, good for creator content.",
      "Sticker label box. Text: 2-4 words in the caption font, caps, centered, one key word. Motion: supporting words fade up, then the key word pops in on a filled label in the accent color rotated -4 degrees (corner radius 0.3 em, small hard shadow), scaling 0 to 1.25 to 0.96 to 1.0. Timing: 100 ms stagger, the sticker pop takes 400 ms. Effect: physical and handmade. End: hold 700 ms, then the sticker scales to 0 in 150 ms.",
      "label scale 0 to 1.25 to 1.0, rotate -24 to -4 degrees", "key word on a filled accent label, rotated -4 degrees",
      "label scales to 0 in 150 ms", "400 ms pop, 100 ms stagger, holds 700 ms", "cubic-bezier(.34,1.56,.64,1)", "sticker", ["BEST", "*DEAL", "EVER"]),

    s("underline-draw", "Underline draw", HIL,
      "A line draws under the key word from left to right. Subtle emphasis, good for premium and explainer videos.",
      "Underline draw. Text: 3-5 words in the caption font, sentence case, centered, one key word. Motion: words fade up 8 px, then a 3 px line in the accent color with rounded ends draws under the key word from left to right. Timing: 250 ms fade, the line starts at 400 ms and draws over 500 ms. Effect: quiet emphasis without recoloring. End: hold 800 ms, then line and text fade out in 150 ms.",
      "words fade up 8 px, underline scaleX 0 to 1 from the left", "3 px accent underline under the key word",
      "line and words fade out in 150 ms", "250 ms fade, line draws at 400 ms for 500 ms, holds 800 ms", "cubic-bezier(.6,0,.2,1)", "underline", ["Simple", "is", "*better"]),

    s("strike-and-replace", "Strike and replace", HIL,
      "An old word gets crossed out and a new word pops in beside it. Good for corrections, myth busting and before/after lines.",
      "Strike and replace. Text: two words in the caption font, caps, centered, the old word first. Motion: the old word appears, a 3 px strike line in the accent color draws across it left to right in 300 ms, the old word dims to 55% opacity, then the new word pops in at scale 0.6 to 1.22 to 1.1 in the accent color. Timing: old word at 0 ms, strike at 400 ms, new word at 720 ms. Effect: a visible correction. End: hold 900 ms, then both fade out in 150 ms.",
      "old word fades in, strike scaleX 0 to 1, new word scale 0.6 to 1.22 to 1.1", "new word in the accent color at scale 1.1",
      "both fade out in 150 ms", "strike 300 ms at 400 ms, new word at 720 ms, holds 900 ms", "cubic-bezier(.34,1.56,.64,1)", "strike", ["HARD", "*SMART"]),

    s("emoji-pop", "Emoji pop", HIL,
      "An emoji bursts in after the key word and wobbles. Friendly and casual, good for lifestyle and social clips.",
      "Emoji pop. Text: 2-4 words in the caption font, centered, with one emoji placed right after the key word. Motion: words fade up 8 px, then the emoji scales from 0 to 1.6 and rotates 10 degrees, rocks to -6 and 4 degrees and settles at 1.0. Timing: 120 ms word stagger, the emoji pops at 450 ms and takes 600 ms. Effect: adds feeling the words alone lack. End: hold 800 ms, then the emoji shrinks to 0 and the line fades out in 150 ms.",
      "emoji scale 0 to 1.6 to 1.0, rotation -30 to 10 to 0 degrees", "emoji beside the key word",
      "emoji scales to 0, line fades out in 150 ms", "120 ms stagger, emoji at 450 ms for 600 ms, holds 800 ms", "cubic-bezier(.34,1.56,.64,1)", "emoji", ["THIS", "IS", "*FIRE"]),

    s("comment-reply-bubble", "Comment reply bubble", HIL,
      "A small 'replying to' tag above a speech bubble, like the TikTok reply-to-comment sticker. Good for Q&A and answer videos.",
      "Comment reply bubble. Text: a small tag above reading 'Replying to @name' (9-11 px caps, pill shape, translucent), and below it the comment in a white speech bubble with dark text, rounded corners (1 em) and a squared bottom-left corner. Motion: the tag slides down from 13 px above and fades in, then the bubble scales from 0.2 to 1.07 to 1.0 with its origin at the bottom left. Timing: tag at 0 ms in 250 ms, bubble at 160 ms in 330 ms. Effect: a real comment appearing on screen. End: hold 1.5 s, then both scale to 0.8 and fade out in 200 ms.",
      "tag drops 13 px and fades in, bubble scales 0.2 to 1.07 to 1.0 from the bottom left", "none",
      "scale to 0.8 and fade out in 200 ms", "tag 250 ms, bubble 330 ms starting at 160 ms, holds 1.5 s", "cubic-bezier(.3,1.4,.5,1)", "bubble", ["How", "do", "you", "*start"]),

    /* ---------- Glow & texture ---------- */
    s("neon-flicker", "Neon flicker", GLO,
      "Glowing tube text that flickers on like a sign warming up. Night, music and nightlife.",
      "Neon flicker. Text: 1-3 words in the caption font, caps, centered, thin to medium weight, a glow of 3 px, 9 px, 20 px and 38 px blur layers in the accent color. Motion: the text flickers on with random opacity jumps (8%, 90%, 15%, 100%, 30%) in hard steps, then holds steady with one short dip near the end. Timing: the flicker takes 450 ms with a 180 ms stagger between words. Effect: a neon sign switching on. End: hold 1.2 s, then cut to a dim 8% in 80 ms.",
      "opacity jumps 8% to 90% to 15% to 100% to 30% to 100% in hard steps", "accent glow with a layered text shadow",
      "cut to 8% opacity in 80 ms", "450 ms flicker, 180 ms stagger, holds 1.2 s", "steps(1, end)", "neon", ["OPEN", "ALL", "*NIGHT"]),

    s("outline-to-fill", "Outline to fill", GLO,
      "Words start as thin outlines and fill in with color. Bold and graphic, good for titles and sports.",
      "Outline to fill. Text: 1-3 words in the caption font, caps, heavy weight, centered. Motion: words appear as a 1.5 px outline with an empty interior, then a left to right fill wipes across each word in the base color (accent color for the key word). Timing: 280 ms stagger, fill takes 620 ms. Effect: a graphic title being inked in. End: hold 800 ms, then fade out in 150 ms.",
      "outline only, then a hard-edge fill wipe left to right", "key word fills with the accent color",
      "fade out in 150 ms", "620 ms fill, 280 ms stagger, holds 800 ms", "cubic-bezier(.5,0,.2,1)", "outlinefill", ["ALL", "IN", "*NOW"]),

    s("shimmer-sweep", "Shimmer sweep", GLO,
      "A band of light glides across dull text and makes it shine. Premium, good for luxury, beauty and jewelry.",
      "Shimmer sweep. Text: 2-4 words in the caption font, caps or sentence case, centered, set at 55% brightness. Motion: a soft white highlight band (110 degree angle, about 25% of the word width) glides left to right across each word, lighting it to full brightness as it passes. Timing: 160 ms stagger, the sweep takes 1.1 s. Effect: polished metal catching light. End: words stay at full brightness for 600 ms, then fade out in 200 ms.",
      "text at 55% brightness, a 110 degree highlight band sweeps across", "key word shines in the accent color",
      "fade out in 200 ms", "1.1 s sweep, 160 ms stagger, holds 600 ms", "ease-in-out", "shimmer", ["PURE", "*GOLD", "SHINE"]),

    s("handwritten-draw-on", "Handwritten draw-on", GLO,
      "Words are written out as if by a pen. Personal and warm, good for notes, quotes and travel.",
      "Handwritten draw-on. Text: 2-4 words in a casual handwritten script (not the caption font), italic, centered. Motion: each word is drawn on from left to right in a smooth reveal as if written by a pen. Timing: 560 ms per word, words written one after another, no overlap. Effect: personal and hand-made. End: the finished line holds 1 s and fades out in 200 ms.",
      "left to right pen reveal of each word, no pop", "none", "fade out in 200 ms",
      "560 ms per word, written in order, holds 1 s", "cubic-bezier(.4,0,.4,1)", "handwrite", ["with", "love", "*always"]),

    s("drop-shadow-3d-extrude", "Drop-shadow 3D extrude", GLO,
      "Text with a thick stepped shadow that gives it depth. Retro, bold, good for game and comic energy.",
      "Drop-shadow 3D extrude. Text: 1-3 words in the caption font, caps, heavy weight, centered. Motion: each word grows a 6-step extruded shadow in a darker shade of the accent color (1 px per step toward the bottom right) plus a soft blurred drop shadow, while the face of the word shifts up 3 px to the left to match. Timing: 130 ms stagger, the extrusion grows over 430 ms with a small overshoot. Effect: a solid 3D block letter. End: hold 800 ms, then the extrusion collapses and the word fades out in 200 ms.",
      "text-shadow grows from 0 to 6 px in 1 px layers, face shifts 3 px up and left", "accent extrusion",
      "extrusion collapses and word fades out in 200 ms", "430 ms extrusion, 130 ms stagger, holds 800 ms", "cubic-bezier(.3,1.3,.5,1)", "extrude", ["BIG", "*BOLD", "MOVE"]),

    /* ---------- Creator styles ---------- */
    s("hormozi-style", "Hormozi style", CRE,
      "All caps, one to three words, very heavy sans with a black outline and an accent emphasis word. The business short-form standard.",
      "Hormozi-style caption. Text: 1-3 words at a time, all caps, extra-bold weight in the caption font, black outline of 1 px and a 3 px hard drop shadow, centered in the middle third, size about 9% of frame height. Motion: each word pops in from scale 0.6 to 1.2 to 1.0, the emphasis word in the accent color stays at 1.08 and the rest in the base color. Timing: 150 ms between words, 280 ms per pop, groups change every 350-700 ms with the speech. Effect: loud, direct and fast to read with sound off. End: each group cuts or fades out in 100 ms as the next appears.",
      "scale 0.6 to 1.2 to 1.0, opacity 0 to 1", "emphasis word in the accent color at scale 1.08",
      "group cuts out in 100 ms", "280 ms pop, 150 ms stagger, groups of 1-3 words every 350-700 ms",
      "cubic-bezier(.3,1.5,.5,1)", "hormozi", ["STOP", "*SCROLLING", "NOW"]),

    s("mrbeast-style", "MrBeast style", CRE,
      "Very thick stroke, hard offset shadow, bouncy entry and a color-cycling emphasis word. Maximum loudness for broad audiences.",
      "MrBeast-style caption. Text: 1-3 words at a time, all caps, extra-bold weight in the caption font, a 5 px black outline and a hard 4 px by 5 px black offset shadow, centered, size about 10% of frame height. Motion: each word jumps up from 40 px below at scale 0.5 and tilted -6 degrees, overshoots to 16 px high at 1.15 and settles flat, and the emphasis word cycles its fill between the accent color and two bright contrast colors every 400 ms. Timing: 130 ms stagger, 480 ms per bounce. Effect: oversized and unmissable. End: hold until the next phrase, then cut out in 80 ms.",
      "translateY 40 px, scale 0.5, rotate -6 degrees to 16 px high at 1.15 to rest", "emphasis word cycles between the accent color and two bright colors every 400 ms",
      "hard cut in 80 ms", "480 ms bounce, 130 ms stagger, color change every 400 ms", "cubic-bezier(.34,1.56,.64,1)", "mrbeast", ["THIS", "IS", "*INSANE"]),

    s("dynamic-minimal", "Dynamic minimal", CRE,
      "Small sentence-case text low in the frame with a soft fade. The quieter 2026 direction, good for premium and documentary content.",
      "Dynamic minimal caption. Text: one or two lines in the caption font, sentence case, medium weight at about 3.5% of frame height, left or center aligned in the lower third, no outline, one subtle bold word for emphasis. Motion: each word fades in with a 4 px rise, no scale and no bounce. Timing: 220 ms stagger, 400 ms per fade. Effect: calm and trustworthy, the picture stays the hero. End: hold until the phrase ends, then fade out in 250 ms.",
      "opacity 0 to 1 with a 4 px rise", "key word set in bold weight, same color",
      "fade out in 250 ms", "400 ms fade, 220 ms stagger", "ease-out", "minimal", ["Most", "people", "*never start"]),

    s("luxury-serif", "Luxury serif", CRE,
      "Small widely tracked serif caps with a slow fade. Quiet, high-end, good for fashion, real estate and wealth content.",
      "Luxury serif caption. Text: 2-4 words in a refined serif font (not the caption font), caps, regular weight at about 3% of frame height, letter spacing 0.3 em, centered in the lower third or at the vertical middle, generous margins. Motion: each word fades in slowly while 3 px of blur resolves and the tracking tightens from 0.45 em to 0.3 em. Timing: 380 ms stagger, 800 ms per fade. Effect: restrained and expensive. End: hold 1.2 s, then fade out in 400 ms.",
      "opacity 0 to 1, blur 3 px to 0, tracking 0.45 em to 0.3 em", "key word in the accent color",
      "fade out in 400 ms", "800 ms fade, 380 ms stagger, holds 1.2 s", "cubic-bezier(.4,0,.2,1)", "luxury", ["THE", "*QUIET", "LIFE"]),

    s("soft-rounded-highlight", "Soft rounded highlight", CRE,
      "Friendly rounded type with a soft pastel box behind the key word. Approachable, good for education, wellness and productivity.",
      "Soft rounded highlight caption. Text: 3-6 words per line in a rounded sans font, sentence case, bold, centered in the lower third, near black or the base color. Motion: words fade up 8 px, then a pastel box (the accent color at 38% mixed with white, corner radius 0.55 em, padding 0.38 em sideways) scales in behind the key word from scale 0.6 by 0.4 to full size with a small overshoot. Timing: 110 ms stagger, the box lands at 450 ms over 350 ms. Effect: warm and approachable. End: hold 1 s, then fade out in 200 ms.",
      "words fade up 8 px, pastel box scales 0.6x0.4 to 1.0", "key word on a soft pastel box with dark text",
      "fade out in 200 ms", "110 ms stagger, box at 450 ms for 350 ms, holds 1 s", "cubic-bezier(.3,1.3,.5,1)", "softbox", ["Make", "it", "*simple"]),

    s("podcast-two-line", "Podcast two-line subtitle", CRE,
      "Classic two-line subtitles on a dark band near the bottom. Easy on the eyes for long talks and interviews.",
      "Podcast two-line subtitle. Text: a maximum of 2 lines, about 32 characters each, in the caption font, sentence case, medium weight at about 3% of frame height, centered near the bottom with a 10% margin, each line on a semi-transparent black band (72% opacity, 3 px radius). Motion: lines fade in with no movement. Timing: each caption shows for the length of the phrase, 1.5-3 s, and swaps with a 100 ms cross fade. Effect: readable for long sessions, never competes with the speakers. End: the caption clears 150 ms after the speaker pauses.",
      "opacity 0 to 1 in 100 ms, no movement", "none",
      "fade out 150 ms after the speaker pauses", "1.5-3 s per caption, 100 ms cross fade between captions", "linear", "podcast", ["So what", "did you", "learn from", "that mistake"])

  ] };
})();
