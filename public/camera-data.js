/* Camera library: 46 moves, 22 angles, 9 shot sizes.
   Source: Kapwing, "The Complete AI Camera Prompt Guide: 77 Shots and Movements"
   https://www.kapwing.com/resources/the-complete-ai-camera-prompt-guide-77-shots-and-movements/
   Prompts are kept as published so they stay reusable across Seedance, Veo, Kling, Runway and Sora. */
window.CAMERA_LIB = {
 "source": "https://www.kapwing.com/resources/the-complete-ai-camera-prompt-guide-77-shots-and-movements/",
 "moves": [
  {
   "title": "Static shot",
   "category": "Pan/Tilt",
   "hint": "Locked tripod. Forces total focus on the subject.",
   "prompt": "locked-off static shot. Camera: fixed on a tripod, zero movement for the whole clip, the frame identical from first second to last. Framing: one deliberate composition held throughout, the subject placed and left alone. Effect: total attention on the subject, calm authority, nothing to hide behind. End: the frame is still identical when the clip ends.",
   "video": "https://cdn-useast1.kapwing.com/static/efj-static-shot.mp4"
  },
  {
   "title": "Pan right",
   "category": "Pan/Tilt",
   "hint": "Scan a room, follow action, or reveal something off-screen.",
   "prompt": "pan right. Camera: fixed in place, rotating steadily on its axis from left to right, the turn smooth and unbroken. Framing: horizon held level while fresh space enters from the right. Effect: a controlled reveal or survey of the scene. End: settles on a composed final frame.",
   "video": "https://cdn-useast1.kapwing.com/static/mh4-pan-right.mp4"
  },
  {
   "title": "Pan left",
   "category": "Pan/Tilt",
   "hint": "Same scan, opposite direction.",
   "prompt": "pan left. Camera: fixed in place, rotating steadily on its axis from right to left, the turn unbroken and even. Framing: horizon held level while fresh space slides in from the left edge. Effect: a calm survey of the space, the reveal arriving from the left. End: the rotation settles on a composed final frame.",
   "video": "https://cdn-useast1.kapwing.com/static/CNb-pan-left.mp4"
  },
  {
   "title": "Whip pan right",
   "category": "Pan/Tilt",
   "hint": "Violent snap between subjects. Energy, comedy, surprise.",
   "prompt": "whip pan right. Camera: snaps hard to the right on its axis in a fraction of a second, streaking the frame with motion blur mid-turn. Framing: launches from one readable composition and lands cleanly on a second target to the right. Effect: shock, energy, a jolt of comedy or surprise. End: sharp and settled on the new subject.",
   "video": "https://cdn-useast1.kapwing.com/static/Wvv-whip-pan-right.mp4"
  },
  {
   "title": "Whip pan left",
   "category": "Pan/Tilt",
   "hint": "A sudden snap to a new subject on the left.",
   "prompt": "whip pan left. Camera: snaps hard to the left on its axis in a fraction of a second, creating strong motion blur through the turn. Framing: launches from one readable composition and lands on a second target to the left. Effect: shock, energy, comedy or surprise. End: sharp and stable on the new subject.",
   "video": "https://cdn-useast1.kapwing.com/static/TV1-whip-pan-left.mp4"
  },
  {
   "title": "Tilt up",
   "category": "Pan/Tilt",
   "hint": "Reveal height, power, scale, or a character from the ground up.",
   "prompt": "tilt up. Camera: remains fixed in position while the lens rotates steadily upward. Framing: the vertical subject remains readable as the frame climbs from low to high. Effect: reveals scale, height or authority. End: settles cleanly on the upper subject.",
   "video": "https://cdn-useast1.kapwing.com/static/r4P-tilt-up.mp4"
  },
  {
   "title": "Tilt down",
   "category": "Pan/Tilt",
   "hint": "Look down at something small, weak, or below.",
   "prompt": "tilt down. Camera: fixed position, the lens dropping steadily from high to low. Framing: the vertical subject stays centred as the frame descends it. Effect: what waits below revealed slowly; smallness, vulnerability, the thing underfoot. End: comes to rest on the lower target.",
   "video": "https://cdn-useast1.kapwing.com/static/tXA-tilt-down.mp4"
  },
  {
   "title": "Fast zoom in",
   "category": "Zoom/Lens",
   "hint": "A sudden discovery or reality check.",
   "prompt": "fast zoom in. Camera: locked position, the lens tightening in one quick decisive move. Framing: the target held centred and readable through the size change. Effect: sudden discovery, a point made hard. End: stable on the tighter frame.",
   "video": "https://cdn-useast1.kapwing.com/static/jEQ-fast-zoom-in.mp4"
  },
  {
   "title": "Fast zoom out",
   "category": "Zoom/Lens",
   "hint": "Quick pull-back reveal.",
   "prompt": "fast zoom out. Camera: locked position, the lens widening in one quick decisive move. Framing: the target held readable as its surroundings burst into frame. Effect: a snap reveal of context, the bigger picture landing at once. End: stable on the wider frame.",
   "video": "https://cdn-useast1.kapwing.com/static/YzU-fast-zoom-out.mp4"
  },
  {
   "title": "Slow zoom in",
   "category": "Zoom/Lens",
   "hint": "Creeping tension. Focus attention on what matters.",
   "prompt": "slow zoom in. Camera: remains physically locked while the lens gradually tightens throughout the shot. Framing: the subject grows slowly within the frame without changing position. Effect: mounting tension and concentration. End: close and deliberate.",
   "video": "https://cdn-useast1.kapwing.com/static/iBn-slow-zoom-in.mp4"
  },
  {
   "title": "Slow zoom out",
   "category": "Zoom/Lens",
   "hint": "Gradually reveal context or isolation.",
   "prompt": "slow zoom out. Camera: remains fixed while the lens gradually widens. Framing: the subject becomes smaller as more of the environment enters the frame. Effect: growing context, distance or isolation. End: settles on the wider composition.",
   "video": "https://cdn-useast1.kapwing.com/static/A7Y-slow-zoom-out.mp4"
  },
  {
   "title": "Crash zoom in",
   "category": "Zoom/Lens",
   "hint": "Shock, realization, comedic emphasis.",
   "prompt": "crash zoom in. Camera: the lens slams tighter almost instantly, an aggressive punch of magnification. Framing: the target stays legible through the violence of the move. Effect: shock, realisation, comic emphasis. End: lands hard on a bold close frame.",
   "video": "https://cdn-useast1.kapwing.com/static/5iM-crash-zoom-in.mp4"
  },
  {
   "title": "Crash zoom out",
   "category": "Zoom/Lens",
   "hint": "An absurd wider-context reveal.",
   "prompt": "crash zoom out. Camera: the lens slams wider almost instantly, an aggressive punch outward. Framing: the target remains readable as a huge amount of context crashes into frame. Effect: surprise or comedy through sudden scale. End: lands hard on the wide reveal.",
   "video": "https://cdn-useast1.kapwing.com/static/EJL-crash-zoom-out.mp4"
  },
  {
   "title": "Dolly in",
   "category": "Dolly/Track",
   "hint": "Physically approach. Intimate, dramatic, or threatening.",
   "prompt": "dolly in. Camera: travels physically forward toward the subject in a straight line, glide steady, height constant. Framing: the distance closes while the subject's place in frame holds, the background easing past on both sides. Effect: growing intimacy or dread; the audience walked toward what matters. End: settles close.",
   "video": "https://cdn-useast1.kapwing.com/static/7TC-dolly-in.mp4"
  },
  {
   "title": "Dolly out",
   "category": "Dolly/Track",
   "hint": "Leave a defeated or isolated character behind.",
   "prompt": "dolly out. Camera: travels physically backward from the subject in a straight line, glide steady, height constant. Framing: the subject holds their place while the room grows around them. Effect: abandonment, isolation, a moment being let go. End: settles wide, subject left behind.",
   "video": "https://cdn-useast1.kapwing.com/static/aa9-dolly-out.mp4"
  },
  {
   "title": "Tracking shot",
   "category": "Dolly/Track",
   "hint": "Glide with the subject through a busy scene.",
   "prompt": "tracking shot. Camera: moves with the subject through the scene, matching their pace and path. Framing: the subject remains consistently placed while the environment flows around them. Effect: immersion and forward momentum. End: remains with the subject.",
   "video": "https://cdn-useast1.kapwing.com/static/c1l-tracking-shot.mp4"
  },
  {
   "title": "Side tracking",
   "category": "Dolly/Track",
   "hint": "Travel beside the subject while they move.",
   "prompt": "side tracking shot. Camera: travels laterally beside the moving subject, matching their speed and maintaining a constant distance. Framing: subject held in profile while the background slides horizontally. Effect: clean momentum and spatial movement. End: stays alongside.",
   "video": "https://cdn-useast1.kapwing.com/static/S8O-side-tracking.mp4"
  },
  {
   "title": "Vehicle tracking",
   "category": "Dolly/Track",
   "hint": "Chase a car, bike, or train at speed.",
   "prompt": "vehicle tracking shot. Camera: travels alongside the moving vehicle, holding its speed. Framing: the vehicle pinned steady while road and scenery tear past. Effect: speed made physical; the machine the one constant in a flying world. End: still at full pace.",
   "video": "https://cdn-useast1.kapwing.com/static/V5--vehicle-tracking.mp4"
  },
  {
   "title": "Chase shot",
   "category": "Dolly/Track",
   "hint": "Messy, urgent, barely keeping up.",
   "prompt": "chase shot. Camera: races after the moving subject from behind, struggling slightly to keep pace. Framing: the subject remains the target while the environment rushes past and movement feels urgent. Effect: pursuit and instability. End: still chasing.",
   "video": "https://cdn-useast1.kapwing.com/static/Kkb-chase-shot.mp4"
  },
  {
   "title": "Follow shot / over-the-shoulder",
   "category": "Dolly/Track",
   "hint": "See the world as they see it. Suspense.",
   "prompt": "follow shot from behind. Camera: trails the subject at shoulder height along their route, keeping their pace. Framing: their back and shoulder anchor the foreground, the route ahead readable past them. Effect: suspense; the world arriving exactly as they meet it. End: still in tow behind them.",
   "video": "https://cdn-useast1.kapwing.com/static/uen-follow-shot-over-the-shoulder.mp4"
  },
  {
   "title": "Reverse tracking / walk-and-talk",
   "category": "Dolly/Track",
   "hint": "Move backward in front while staying locked on the subject.",
   "prompt": "reverse tracking walk-and-talk. Camera: travels backward directly in front of the moving subject while matching their pace. Framing: face and upper body stay consistently framed as the environment unfolds behind them. Effect: conversational momentum and immediacy. End: still retreating with the subject.",
   "video": "https://cdn-useast1.kapwing.com/static/nnn-reverse-tracking-walk-and-talk.mp4"
  },
  {
   "title": "Low tracking",
   "category": "Dolly/Track",
   "hint": "Track boots, wheels, or paws at ground level.",
   "prompt": "low tracking shot. Camera: skims along at ground height beside the moving subject. Framing: boots, wheels or paws large in frame, the ground plane rushing through. Effect: grit and mystery, identity withheld, pace felt through the floor. End: the low perspective held to the last frame.",
   "video": "https://cdn-useast1.kapwing.com/static/Max-low-tracking.mp4"
  },
  {
   "title": "Truck left",
   "category": "Physical Moves",
   "hint": "Slide the entire camera sideways to the left.",
   "prompt": "truck left. Camera: slides bodily to the left along a straight lateral path, the lens facing forward throughout. Framing: the scene glides across frame as the viewpoint shifts sideways. Effect: a measured lateral reveal, walking the room with your eyes. End: a clean stop on the new composition.",
   "video": "https://cdn-useast1.kapwing.com/static/2_6-truck-left.mp4"
  },
  {
   "title": "Truck right",
   "category": "Physical Moves",
   "hint": "Slide sideways parallel to the action.",
   "prompt": "truck right. Camera: slides bodily to the right along a straight lateral path, the lens facing forward throughout. Framing: the scene glides across frame as the viewpoint shifts sideways. Effect: a measured lateral reveal, walking the room with your eyes. End: a clean stop on the new composition.",
   "video": "https://cdn-useast1.kapwing.com/static/cxK-truck-right.mp4"
  },
  {
   "title": "Pedestal up",
   "category": "Physical Moves",
   "hint": "Rise vertically without tilting.",
   "prompt": "pedestal up. Camera: rises straight upward while staying level, lifting the entire camera instead of tilting the lens. Framing: the frame climbs the subject from bottom to top. Effect: a controlled vertical reveal. End: holds the elevated framing.",
   "video": "https://cdn-useast1.kapwing.com/static/VrE-pedestal-up.mp4"
  },
  {
   "title": "Pedestal down",
   "category": "Physical Moves",
   "hint": "Sink straight down without tilting.",
   "prompt": "pedestal down. Camera: sinks straight downward, staying level, the whole camera lowering rather than tilting. Framing: the frame descends the subject top to bottom with the lens kept square. Effect: coming down to ground truth, the detail beneath the surface. End: holds the lower framing.",
   "video": "https://cdn-useast1.kapwing.com/static/x1n-pedestal-down.mp4"
  },
  {
   "title": "Slider left",
   "category": "Physical Moves",
   "hint": "A short, precise sideways move to the left.",
   "prompt": "slider left. Camera: glides a short controlled distance horizontally to the left. Framing: nearby foreground elements shift faster than the background, creating subtle parallax. Effect: polished depth and a compact reveal. End: settles cleanly.",
   "video": "https://cdn-useast1.kapwing.com/static/6Cq-slider-left.mp4"
  },
  {
   "title": "Slider right",
   "category": "Physical Moves",
   "hint": "A short, precise sideways move to the right.",
   "prompt": "slider right. Camera: glides a short controlled distance horizontally to the right. Framing: foreground elements shift against the background, creating clean parallax. Effect: polished dimensional movement in a tight space. End: settles cleanly.",
   "video": "https://cdn-useast1.kapwing.com/static/7aQ-slider-right.mp4"
  },
  {
   "title": "Arc left",
   "category": "Physical Moves",
   "hint": "Curve around the subject toward the left.",
   "prompt": "arc left. Camera: travels along a curved path around the subject toward the left while maintaining a consistent distance. Framing: the subject stays dominant as the background rotates behind them. Effect: dimensional reveal and cinematic movement. End: settles on the new angle.",
   "video": "https://cdn-useast1.kapwing.com/static/hvZ-arc-left.mp4"
  },
  {
   "title": "Arc right",
   "category": "Physical Moves",
   "hint": "Curve around the subject toward the right.",
   "prompt": "arc right. Camera: travels along a curved path around the subject toward the right while maintaining a consistent distance. Framing: subject remains dominant as the background shifts around them. Effect: dimensional reveal and cinematic movement. End: settles on the new angle.",
   "video": "https://cdn-useast1.kapwing.com/static/TjY-arc-right.mp4"
  },
  {
   "title": "Orbit clockwise",
   "category": "Physical Moves",
   "hint": "Circle clockwise around the subject.",
   "prompt": "clockwise orbit. Camera: circle clockwise around the main subject at a consistent radius. Speed: smooth controlled orbit. Framing: keep the subject centered while the background rotates around them. End: complete the intended arc or full circle with stable framing.",
   "video": "https://cdn-useast1.kapwing.com/static/0tz-orbit-clockwise.mp4"
  },
  {
   "title": "Orbit counterclockwise",
   "category": "Physical Moves",
   "hint": "Circle counterclockwise around the subject.",
   "prompt": "counterclockwise orbit. Camera: circle counterclockwise around the main subject at a consistent radius. Speed: smooth and controlled. Framing: keep the subject centered while the background rotates around them. End: complete the intended arc with stable framing.",
   "video": "https://cdn-useast1.kapwing.com/static/M_v-orbit-counterclockwise.mp4"
  },
  {
   "title": "Push past / pass-by shot",
   "category": "Physical Moves",
   "hint": "Push toward a subject, pass them, and continue beyond.",
   "prompt": "push-past pass-by shot. Camera: travels directly toward the subject, slips close past their side, then continues forward into the space beyond them. Framing: the subject grows, crosses the edge of frame, then reveals what was behind. Effect: transition, discovery and momentum.",
   "video": "https://cdn-useast1.kapwing.com/static/V5s-push-past-pass-by-shot.mp4"
  },
  {
   "title": "First-person view",
   "category": "Human Camera",
   "hint": "Put the viewer directly inside the character's perspective.",
   "prompt": "first-person POV. Camera: becomes the character's eyes, moving naturally through the environment at human head height. Framing: hands or nearby objects may enter naturally while the world remains the focus. Effect: direct immersion and presence.",
   "video": "https://cdn-useast1.kapwing.com/static/nzy-first-person-view.mp4"
  },
  {
   "title": "Handheld shot",
   "category": "Human Camera",
   "hint": "Natural human shake and imperfect movement.",
   "prompt": "handheld shot. Camera: operated by hand with subtle organic shake, small reframing corrections and imperfect human movement. Framing: subject remains readable without mechanical stability. Effect: immediacy, realism and documentary energy.",
   "video": "https://cdn-useast1.kapwing.com/static/jZO-handheld-shot.mp4"
  },
  {
   "title": "Crane up",
   "category": "Drone/Crane",
   "hint": "Rise dramatically above the scene.",
   "prompt": "crane up. Camera: rises smoothly upward through space on a broad vertical path. Framing: begins closer to subject level and progressively reveals more surrounding environment. Effect: scale, release and dramatic expansion. End: elevated wide view.",
   "video": "https://cdn-useast1.kapwing.com/static/Ed_-crane-up.mp4"
  },
  {
   "title": "Crane down",
   "category": "Drone/Crane",
   "hint": "Descend from a wide overview into the scene.",
   "prompt": "crane down. Camera: descends smoothly from above toward the subject. Framing: begins with broad context and gradually brings the subject into stronger prominence. Effect: entering the scene and narrowing attention. End: settles near subject level.",
   "video": "https://cdn-useast1.kapwing.com/static/3mP-crane-down.mp4"
  },
  {
   "title": "Drone pull back",
   "category": "Drone/Crane",
   "hint": "Fly backward to reveal a much larger environment.",
   "prompt": "drone pull back. Camera: flies smoothly backward away from the subject while maintaining stable altitude or gently gaining height. Framing: subject shrinks as the surrounding landscape expands. Effect: scale, isolation and geographic reveal.",
   "video": "https://cdn-useast1.kapwing.com/static/T8s-drone-pull-back.mp4"
  },
  {
   "title": "Drone push in",
   "category": "Drone/Crane",
   "hint": "Fly directly toward the subject from a wide view.",
   "prompt": "drone push in. Camera: flies steadily forward toward the subject through open space. Framing: begins wide and progressively closes distance while keeping the target stable. Effect: epic approach and increasing focus. End: settles nearer the subject.",
   "video": "https://cdn-useast1.kapwing.com/static/FsU-drone-push-in.mp4"
  },
  {
   "title": "Helicopter shot",
   "category": "Drone/Crane",
   "hint": "High-speed aerial movement across a large landscape.",
   "prompt": "helicopter aerial shot. Camera: flies smoothly at altitude while traveling across or alongside the scene. Framing: wide landscape remains readable while the viewpoint moves with speed and scale. Effect: cinematic scope, geography and momentum.",
   "video": "https://cdn-useast1.kapwing.com/static/10D-helicopter-shot.mp4"
  },
  {
   "title": "Body-mounted camera / Snorricam",
   "category": "Specials",
   "hint": "Lock the camera to the actor so the world moves around them.",
   "prompt": "body-mounted Snorricam shot. Camera: rigidly mounted to the subject, maintaining the same distance and angle to their face or torso while they move. Framing: subject remains unnaturally fixed as the entire environment swings and shifts behind them. Effect: disorientation and intense subjectivity.",
   "video": "https://cdn-useast1.kapwing.com/static/vCB-body-mounted-camera-snorricam.mp4"
  },
  {
   "title": "Pass through objects",
   "category": "Specials",
   "hint": "Move impossibly through walls, windows, or solid objects.",
   "prompt": "pass-through-object shot. Camera: travels continuously forward and passes impossibly through a solid foreground object without stopping. Framing: movement remains smooth before, during and after the transition. Effect: surreal continuity and impossible spatial movement.",
   "video": "https://cdn-useast1.kapwing.com/static/H93-pass-through-objects.mp4"
  },
  {
   "title": "Tilt shift",
   "category": "Specials",
   "hint": "Create a miniature-world or selective-focus look.",
   "prompt": "tilt-shift lens effect. Camera: hold a stable elevated view while applying a narrow selective-focus plane across the scene. Framing: central details remain sharp while foreground and background blur strongly. Effect: miniature scale and toy-like depth.",
   "video": "https://cdn-useast1.kapwing.com/static/imm-tilt-shift.mp4"
  },
  {
   "title": "Time lapse",
   "category": "Specials",
   "hint": "Compress a long period of time into a few seconds.",
   "prompt": "time-lapse shot. Camera: remains stable while time moves dramatically faster than normal. Framing: architecture or the primary subject stays anchored while clouds, traffic, crowds, shadows or light evolve rapidly. Effect: compressed time and visible change.",
   "video": "https://cdn-useast1.kapwing.com/static/pvR-time-lapse.mp4"
  },
  {
   "title": "Earth zoom out",
   "category": "Specials",
   "hint": "Pull from the subject all the way to an enormous planetary scale.",
   "prompt": "earth zoom out. Camera: begins close to the subject or location and accelerates backward through increasingly larger scales, revealing city, region, continent and planet. Framing: keep the origin point centered through the transition. Effect: extreme scale reveal.",
   "video": "https://cdn-useast1.kapwing.com/static/qm2-earth-zoom-out.mp4"
  },
  {
   "title": "Infinite zoom",
   "category": "Specials",
   "hint": "Continuously travel deeper through nested scenes.",
   "prompt": "infinite zoom. Camera: continuously pushes deeper into the image as each layer seamlessly becomes another complete scene. Framing: maintain a clear central visual target through every transition. Effect: hypnotic impossible scale and endless forward motion.",
   "video": "https://cdn-useast1.kapwing.com/static/BFf-infinite-zoom.mp4"
  }
 ],
 "angles": [
  {
   "title": "Bird's-eye view",
   "hint": "Look almost vertically down from high above the subject.",
   "prompt": "bird's-eye view. Camera: positioned very high above the subject, looking almost straight down. Framing: the subject appears small within the surrounding environment. Effect: geography, scale and a detached overview.",
   "thumb": "https://cdn-useast1.kapwing.com/static/iJx-angle-bird-s-eye.webp"
  },
  {
   "title": "Dutch tilt",
   "hint": "Cant the horizon to create tension or instability.",
   "prompt": "Dutch tilt. Camera: rotated slightly on its roll axis so the horizon runs diagonally through the frame. Framing: subject remains readable inside the deliberately unbalanced composition. Effect: unease, tension and instability.",
   "thumb": "https://cdn-useast1.kapwing.com/static/qd6-angle-dutch-tilt.webp"
  },
  {
   "title": "Establishing angle",
   "hint": "Show the subject clearly inside the larger environment.",
   "prompt": "establishing angle. Camera: positioned to clearly reveal both the main subject and the surrounding location. Framing: environment is given enough space to explain where the action is happening. Effect: orientation, geography and context.",
   "thumb": "https://cdn-useast1.kapwing.com/static/xmd-angle-establishing-angle.webp"
  },
  {
   "title": "Extreme Dutch tilt",
   "hint": "Push the diagonal composition to an intentionally extreme angle.",
   "prompt": "extreme Dutch tilt. Camera: heavily rotated on its roll axis, producing a dramatically diagonal horizon. Framing: the subject remains identifiable despite the extreme imbalance. Effect: chaos, disorientation and heightened psychological tension.",
   "thumb": "https://cdn-useast1.kapwing.com/static/-rN-angle-extreme-dutch-tilt.webp"
  },
  {
   "title": "Eye level",
   "hint": "Meet the subject naturally at their own eye height.",
   "prompt": "eye-level angle. Camera: positioned at the subject's natural eye height, looking straight toward them without tilting up or down. Framing: neutral and balanced. Effect: naturalism, equality and direct connection.",
   "thumb": "https://cdn-useast1.kapwing.com/static/uOE-angle-eye-level.webp"
  },
  {
   "title": "From behind",
   "hint": "Place the camera behind the subject looking in their direction.",
   "prompt": "from-behind angle. Camera: positioned directly behind the subject and aimed in the same direction they are facing. Framing: the subject's back anchors the foreground while the environment ahead remains visible. Effect: anticipation and shared discovery.",
   "thumb": "https://cdn-useast1.kapwing.com/static/e1x-angle-from-behind.webp"
  },
  {
   "title": "Ground level",
   "hint": "Place the lens directly at or just above the ground.",
   "prompt": "ground-level angle. Camera: placed extremely low, almost touching the ground. Framing: foreground surfaces dominate and the subject rises above the lens. Effect: texture, scale and a strong physical sense of place.",
   "thumb": "https://cdn-useast1.kapwing.com/static/HlF-angle-ground-level.webp"
  },
  {
   "title": "Hero angle",
   "hint": "Frame the subject to feel confident, powerful, and iconic.",
   "prompt": "hero angle. Camera: positioned slightly below the subject and aimed upward with a strong clean composition. Framing: subject dominates the frame with open space around their silhouette. Effect: confidence, importance and cinematic power.",
   "thumb": "https://cdn-useast1.kapwing.com/static/pYM-angle-hero-angle.webp"
  },
  {
   "title": "High angle",
   "hint": "Look downward at the subject from above eye level.",
   "prompt": "high angle. Camera: positioned above the subject and tilted downward toward them. Framing: the viewer looks down into the scene. Effect: vulnerability, smallness, observation or reduced power.",
   "thumb": "https://cdn-useast1.kapwing.com/static/BAM-angle-high-angle.webp"
  },
  {
   "title": "Hip level",
   "hint": "Set the camera around waist or hip height.",
   "prompt": "hip-level angle. Camera: positioned around the subject's waist or hip height. Framing: perspective sits below normal eye level while remaining relatively neutral. Effect: grounded physicality and an informal cinematic perspective.",
   "thumb": "https://cdn-useast1.kapwing.com/static/74Y-angle-hip-level.webp"
  },
  {
   "title": "Low angle",
   "hint": "Look upward to make the subject feel larger or more powerful.",
   "prompt": "low angle. Camera: positioned below the subject's eye line and tilted upward. Framing: subject rises prominently against the environment or sky. Effect: power, dominance, scale and authority.",
   "thumb": "https://cdn-useast1.kapwing.com/static/Q-V-angle-low-angle.webp"
  },
  {
   "title": "Over-the-shoulder",
   "hint": "Frame past one character's shoulder toward another.",
   "prompt": "over-the-shoulder angle. Camera: positioned behind one subject with part of their shoulder or head visible in the foreground, looking toward the second subject. Framing: foreground person creates depth while attention stays on the person opposite.",
   "thumb": "https://cdn-useast1.kapwing.com/static/S-3-angle-over-the-shoulder.webp"
  },
  {
   "title": "Overhead / top-down",
   "hint": "Point the camera straight down from directly above.",
   "prompt": "overhead top-down angle. Camera: positioned directly above the subject with the lens pointing vertically downward. Framing: shapes, positions and spatial relationships become graphic and easy to read. Effect: pattern, geometry and total spatial clarity.",
   "thumb": "https://cdn-useast1.kapwing.com/static/D5d-angle-overhead-top-down.webp"
  },
  {
   "title": "Point of view (POV)",
   "hint": "Show the scene from exactly where the character is looking.",
   "prompt": "point-of-view angle. Camera: occupies the character's visual position and looks directly at what they would see. Framing: the viewer inherits the character's line of sight. Effect: immersion, subjectivity and direct identification.",
   "thumb": "https://cdn-useast1.kapwing.com/static/cLX-angle-point-of-view-pov.webp"
  },
  {
   "title": "Profile",
   "hint": "View the subject directly from the side.",
   "prompt": "profile angle. Camera: positioned perpendicular to the subject's facing direction, showing them directly from the side. Framing: facial or body silhouette remains clear. Effect: graphic clarity, observation and visual separation.",
   "thumb": "https://cdn-useast1.kapwing.com/static/E0R-angle-profile.webp"
  },
  {
   "title": "Reverse angle",
   "hint": "Cut to the opposite side of an interaction or viewpoint.",
   "prompt": "reverse angle. Camera: positioned opposite the previous viewing direction, looking back toward the subject or scene from the other side. Framing: preserve spatial continuity while revealing the opposing perspective. Effect: reaction, dialogue and visual contrast.",
   "thumb": "https://cdn-useast1.kapwing.com/static/s8j-angle-reverse-angle.webp"
  },
  {
   "title": "Shoulder level",
   "hint": "Place the lens approximately level with the subject's shoulders.",
   "prompt": "shoulder-level angle. Camera: positioned around the subject's shoulder height with a mostly level lens. Framing: slightly lower than eye level while remaining natural and conversational. Effect: grounded intimacy with subtle strength.",
   "thumb": "https://cdn-useast1.kapwing.com/static/m7p-angle-shoulder-level.webp"
  },
  {
   "title": "Single",
   "hint": "Compose the frame around one primary character.",
   "prompt": "single-subject angle. Camera: composition isolates one principal subject without sharing equal visual emphasis with another character. Framing: subject is the clear focal point. Effect: concentration, character emphasis and emotional clarity.",
   "thumb": "https://cdn-useast1.kapwing.com/static/1rg-angle-single.webp"
  },
  {
   "title": "Three-quarter",
   "hint": "View the subject between a front-facing and profile position.",
   "prompt": "three-quarter angle. Camera: positioned approximately 45 degrees from the subject rather than directly frontal or fully profile. Framing: both the front and side planes remain visible. Effect: dimensionality, natural portraiture and depth.",
   "thumb": "https://cdn-useast1.kapwing.com/static/mFl-angle-three-quarter.webp"
  },
  {
   "title": "Two-shot",
   "hint": "Frame two characters together in the same composition.",
   "prompt": "two-shot angle. Camera: frames two principal subjects together in one composition. Framing: both characters remain clearly readable with their relationship and spacing visible. Effect: connection, tension, conversation and shared action.",
   "thumb": "https://cdn-useast1.kapwing.com/static/z0j-angle-two-shot.webp"
  },
  {
   "title": "Upside down",
   "hint": "Rotate the entire viewpoint 180 degrees.",
   "prompt": "upside-down angle. Camera: rotated 180 degrees on its roll axis so the scene appears fully inverted. Framing: subject remains clearly recognizable despite the reversed orientation. Effect: surrealism, disorientation and visual shock.",
   "thumb": "https://cdn-useast1.kapwing.com/static/oqF-angle-upside-down.webp"
  },
  {
   "title": "Worm's-eye view",
   "hint": "Look almost straight upward from an extremely low position.",
   "prompt": "worm's-eye view. Camera: placed at ground level directly beneath or very close to the subject, looking steeply upward. Framing: subject towers dramatically above the lens. Effect: monumental scale, dominance and exaggerated height.",
   "thumb": "https://cdn-useast1.kapwing.com/static/S1Q-angle-worm-s-eye.webp"
  }
 ],
 "sizes": [
  {
   "title": "Extreme wide shot",
   "hint": "Make the environment dominant and the subject very small.",
   "prompt": "extreme wide shot. Framing: show the subject very small within a vast surrounding environment, with location and scale dominating the composition. Effect: isolation, spectacle, geography and enormous visual context.",
   "thumb": "https://cdn-useast1.kapwing.com/static/sk5-size-extreme-wide-shot.webp"
  },
  {
   "title": "Wide shot",
   "hint": "Show the full subject with plenty of surrounding environment.",
   "prompt": "wide shot. Framing: show the subject fully within the surrounding environment, leaving generous space around them so both character and location remain clearly readable. Effect: context, physical action and spatial relationships.",
   "thumb": "https://cdn-useast1.kapwing.com/static/dVt-size-wide-shot.webp"
  },
  {
   "title": "Full shot",
   "hint": "Frame a person from head to toe.",
   "prompt": "full shot. Framing: show the subject's complete body from head to toe, keeping their entire silhouette comfortably inside the frame with enough surrounding space for movement. Effect: body language, wardrobe and physical performance remain fully visible.",
   "thumb": "https://cdn-useast1.kapwing.com/static/ki8-size-full-shot.webp"
  },
  {
   "title": "Medium wide / cowboy",
   "hint": "Frame roughly from the thighs or knees upward.",
   "prompt": "medium wide cowboy shot. Framing: show the subject from approximately mid-thigh or knee level upward, balancing facial expression with body language and surrounding context. Effect: cinematic character framing with room for gestures and action.",
   "thumb": "https://cdn-useast1.kapwing.com/static/BpE-size-medium-wide-cowboy.webp"
  },
  {
   "title": "Medium shot",
   "hint": "Frame the subject around the waist upward.",
   "prompt": "medium shot. Framing: show the subject approximately from the waist upward, keeping the face clearly readable while preserving enough body language and background context. Effect: natural conversation, presentation and character interaction.",
   "thumb": "https://cdn-useast1.kapwing.com/static/a6W-size-medium-shot.webp"
  },
  {
   "title": "Medium close-up",
   "hint": "Frame from roughly the chest or shoulders upward.",
   "prompt": "medium close-up. Framing: show the subject from approximately the chest or shoulders upward, giving the face strong visual priority while retaining a small amount of surrounding context. Effect: intimacy without losing all sense of place.",
   "thumb": "https://cdn-useast1.kapwing.com/static/XZF-size-medium-close-up.webp"
  },
  {
   "title": "Close-up",
   "hint": "Let the face or primary subject dominate the frame.",
   "prompt": "close-up. Framing: fill most of the frame with the subject's face or primary point of interest, minimizing surrounding environment and emphasizing fine expression and detail. Effect: intimacy, emotion and concentrated attention.",
   "thumb": "https://cdn-useast1.kapwing.com/static/zGU-size-close-up.webp"
  },
  {
   "title": "Extreme close-up",
   "hint": "Fill the frame with one very small facial or object detail.",
   "prompt": "extreme close-up. Framing: isolate a very small detail such as the eyes, mouth, fingers or a specific object feature so it fills nearly the entire frame. Effect: extreme intimacy, tension, texture and precise visual emphasis.",
   "thumb": "https://cdn-useast1.kapwing.com/static/CEL-size-extreme-close-up.webp"
  },
  {
   "title": "Insert / macro",
   "hint": "Isolate a tiny object or story-critical detail.",
   "prompt": "insert macro shot. Framing: isolate a small object, surface or story-critical detail in very tight framing, revealing texture and information that would be difficult to see in a wider shot. Effect: precision, emphasis and tactile detail.",
   "thumb": "https://cdn-useast1.kapwing.com/static/fCC-size-insert-macro.webp"
  }
 ]
};
