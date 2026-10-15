(function (root) {
  "use strict";

  var sharedStickBullets = [
    "Each pack contains 28 incense sticks.",
    "Designed for use with a suitable incense stick holder."
  ];
  var sharedConeBullets = [
    "Each pack contains 28 dhoop cones.",
    "Designed for use with a suitable, heat-resistant dhoop cone holder."
  ];
  var stickSteps = [
    "Hold a lit match or lighter to the tip of the incense stick until it catches fire.",
    "Allow the tip to burn briefly, then gently blow out the flame.",
    "Place the stick securely in a heat-resistant incense holder."
  ];
  var coneSteps = [
    { title: "Position the cone", text: "Place one dhoop cone upright on a stable, heat-resistant holder." },
    { title: "Light the tip", text: "Use a match or lighter to ignite the pointed tip until a flame appears." },
    { title: "Extinguish the flame", text: "Gently blow out the flame and allow the cone to smoulder." }
  ];

  var copy = {
    "sticks-rose": {
      usps: ["Soft Floral", "Warm & Sweet", "Romantic Aroma"],
      description: "Inspired by Prema, the Sanskrit word for love and affection, these rose incense sticks bring a soft, floral warmth to your everyday rituals. Their delicate fragrance evokes cherished memories, heartfelt moments and the comfort of a welcoming home.",
      bullets: ["A soft, warm and gently sweet rose fragrance.", "Ideal for quiet evenings, personal rituals and creating an inviting atmosphere at home.", "A thoughtful addition to your daily puja, meditation or moments of relaxation."].concat(sharedStickBullets),
      steps: stickSteps.concat(["Enjoy the gentle fragrance as the incense smoulders."]),
      closing: "Bring Prema home and let every corner hold a little warmth."
    },
    "sticks-mogra": {
      usps: ["Creamy Floral", "Rich & Headily Floral", "Traditional Aroma"],
      description: "Named after Mallika, a traditional Sanskrit name associated with jasmine, this fragrance celebrates the delicate beauty of mogra blossoms. Floral and comforting, it brings to mind fresh flowers, peaceful mornings and the timeless rituals of Indian homes.",
      bullets: ["A creamy, rich and floral mogra fragrance.", "Perfect for morning prayers, festive preparations and everyday home rituals.", "Creates a welcoming atmosphere for moments of stillness and reflection."].concat(sharedStickBullets),
      steps: stickSteps.concat(["Enjoy the delicate floral fragrance as it fills your space."]),
      closing: "Bring Mallika home and let the beauty of flowers linger a little longer."
    },
    "sticks-sandalwood": {
      usps: ["Creamy Woody", "Warm & Earthy", "Grounding Aroma"],
      description: "Chandana means sandalwood, a fragrance deeply associated with Indian traditions and sacred rituals. With its warm, woody character, this incense is made for moments when you want to slow down, reconnect with yourself and bring a sense of familiarity to your surroundings.",
      bullets: ["A smooth, creamy and woody sandalwood fragrance.", "Well suited to meditation, prayer and quiet evening rituals.", "A comforting fragrance for creating a warm and inviting atmosphere at home."].concat(sharedStickBullets),
      steps: stickSteps.concat(["Enjoy the warm, woody fragrance as the incense smoulders."]),
      closing: "Bring Chandana home and rediscover the quiet beauty of timeless traditions."
    },
    "sticks-lavender": {
      usps: ["Herbal Notes", "Clean & Calming", "Gentle Aroma"],
      description: "Shanti is the Sanskrit word for peace and tranquillity. Inspired by the desire for slower, quieter moments, these lavender incense sticks bring a gentle aromatic touch to your evening routine and your favourite corners of home.",
      bullets: ["A clean, herbal and calming lavender fragrance.", "Ideal for winding down in the evening, reading or enjoying a quiet moment to yourself.", "A lovely companion to mindful routines and peaceful home rituals."].concat(sharedStickBullets),
      steps: stickSteps.concat(["Enjoy the gentle herbal fragrance as the incense smoulders."]),
      closing: "Bring Shanti home and make room for a little more stillness in your day."
    },
    "sticks-jasmine": {
      usps: ["Bright Floral", "Green & Fresh", "Sunny Aroma"],
      description: "Saurabha is a Sanskrit word meaning fragrance or pleasant aroma. Inspired by the brightness of jasmine, these incense sticks bring a fresh, floral character to everyday rituals, sunlit mornings and the little moments that make a house feel like home.",
      bullets: ["A bright, green and sunny jasmine fragrance.", "Suitable for morning rituals, welcoming guests and refreshing the atmosphere of your home.", "A beautiful way to add a fragrant touch to everyday living."].concat(sharedStickBullets),
      steps: stickSteps.concat(["Enjoy the bright floral fragrance as the incense smoulders."]),
      closing: "Bring Saurabha home and let every day begin with a breath of fragrance."
    },
    "cones-rose": {
      usps: ["Delicate Rose", "Soft & Sweet", "Warm Aroma"],
      description: "Smriti is the Sanskrit word for memory and remembrance. Inspired by the fragrance of roses and the memories that make a place feel like home, these dhoop cones bring a gentle floral warmth to your everyday rituals.",
      bullets: ["A soft, warm and gently sweet rose fragrance.", "Ideal for daily puja, evening rituals and creating a welcoming atmosphere.", "A fragrant addition to moments spent reconnecting with familiar traditions."].concat(sharedConeBullets),
      steps: coneSteps.concat([{ title: "Enjoy the fragrance", text: "Let the soft aroma of roses fill your space. Never leave a burning cone unattended." }]),
      closing: "Bring Smriti home and let your favourite moments live on through fragrance."
    },
    "cones-mogra": {
      usps: ["Rich Floral", "Creamy Aroma", "Classic Mogra"],
      description: "Kusuma is a Sanskrit word meaning flower or blossom. Inspired by the timeless charm of mogra, these dhoop cones celebrate the floral traditions of Indian homes, bringing a familiar fragrance to your prayers, festive preparations and everyday moments.",
      bullets: ["A creamy, rich and floral mogra fragrance.", "Ideal for morning puja, festive rituals and everyday devotional practices.", "A thoughtful way to bring the fragrance of blossoms into your home."].concat(sharedConeBullets),
      steps: coneSteps.concat([{ title: "Enjoy the fragrance", text: "Let the floral aroma of mogra accompany your everyday rituals. Never leave a burning cone unattended." }]),
      closing: "Bring Kusuma home and let the beauty of blossoms become part of your daily rituals."
    },
    "cones-sandalwood": {
      usps: ["Smooth Woody", "Warm & Earthy", "Traditional Aroma"],
      description: "Dhara means a stream, flow or continuous course. Inspired by the grounding character of sandalwood, these dhoop cones invite you to slow down and reconnect with the rituals that bring meaning to everyday life.",
      bullets: ["A smooth, creamy and woody sandalwood fragrance.", "Suited to prayer, meditation and traditional home rituals.", "A warm aromatic addition to moments of reflection and quiet."].concat(sharedConeBullets),
      steps: coneSteps.concat([{ title: "Enjoy the fragrance", text: "Let the woody aroma of sandalwood accompany your moments of prayer and reflection. Never leave a burning cone unattended." }]),
      closing: "Bring Dhara home and let your daily rituals flow at their own pace."
    },
    "cones-lavender": {
      usps: ["Fresh Herbal", "Soft Lavender", "Evening Ritual"],
      description: "Nivriti is associated with withdrawal from worldly activity, repose and turning inward. Inspired by the herbal character of lavender, these dhoop cones are made for those moments when you want to step away from the day's noise and enjoy a slower, more personal ritual.",
      bullets: ["A clean, herbal and calming lavender fragrance.", "Ideal for quiet evenings, reflective moments and relaxed home rituals.", "A fragrant companion to reading, unwinding and taking time for yourself."].concat(sharedConeBullets),
      steps: coneSteps.concat([{ title: "Enjoy the fragrance", text: "Let the herbal aroma of lavender accompany your quiet moments. Never leave a burning cone unattended." }]),
      closing: "Bring Nivriti home and make space for the simple pleasure of slowing down."
    },
    "cones-jasmine": {
      usps: ["Bright Floral", "Green & Fresh", "Sunny Aroma"],
      description: "Prakriti means nature and the natural world. Inspired by the bright floral character of jasmine, these dhoop cones bring a touch of nature-inspired fragrance to your home, from morning rituals to welcoming guests.",
      bullets: ["A bright, green and sunny jasmine fragrance.", "Ideal for morning puja, festive preparations and everyday home rituals.", "A floral addition to spaces where you gather, reflect and reconnect."].concat(sharedConeBullets),
      steps: coneSteps.concat([{ title: "Enjoy the fragrance", text: "Let the bright floral aroma of jasmine bring a nature-inspired touch to your home. Never leave a burning cone unattended." }]),
      closing: "Bring Prakriti home and rediscover the beauty of everyday rituals."
    },
    "havan-classic": {
      usps: ["Sacred Fire", "Auspicious Beginnings", "Festive Rituals"],
      description: "Mangala represents auspiciousness, good fortune and blessed beginnings. Inspired by the significance of sacred fire in Indian traditions, these havan cups are intended for meaningful occasions, devotional practices and moments that bring families together.",
      bullets: ["Inspired by traditional havan and sacred fire rituals.", "Suitable for appropriate devotional practices and auspicious occasions, following the product's instructions.", "A thoughtful addition to festive preparations, housewarmings and traditional ceremonies."],
      steps: [
        { title: "Prepare the space", text: "Place the havan cup on a stable, non-flammable, heat-resistant surface in a well-ventilated area." },
        { title: "Light the cup", text: "Ignite the designated point according to the instructions supplied with the product." },
        { title: "Allow it to burn safely", text: "Let the cup burn as directed. Keep it away from curtains, flammable materials, children and pets, and never leave it unattended." },
        { title: "Allow it to cool", text: "Wait until the cup and its contents have cooled completely before handling or disposing of the remains." }
      ],
      closing: "Bring Mangala home and honour the traditions that make every beginning meaningful."
    }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = copy;
  else root.RUHANI_PRODUCT_COPY = copy;
}(typeof window !== "undefined" ? window : globalThis));
