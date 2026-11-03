/* ORGANAS — default content & settings.
   Everything here is editable live from the DialKit control panel. */
(function () {
  const fruit = (o) => Object.assign({ show: true }, o);

  const DEF = {
    brand: {
      name: 'Organas',
      logo: 'assets/logo.svg',
      logoWidth: 92,
      colors: { cream: '#FCEFE7', peach: '#FAE2D2', burgundy: '#631928', red: '#D9391B', ink: '#4A1420' },
      fonts: { display: 'Playfair Display', body: 'Figtree' },
      radius: 14
    },

    header: {
      showLang: true, lang1: 'EN', lang2: 'FR',
      menuLabel: 'MENU', closeLabel: 'CLOSE',
      links: { home: 'Home', fruits: 'Fruits', experience: 'Experience', collection: 'Collection', contact: 'Contact' },
      menuFoot: 'info@organas.com  ·  @organas'
    },

    hero: {
      ringText: 'FRESH FROM NATURE · NATURALLY GROWN',
      ringSize: 230, ringSpeed: 26, ringFollowScroll: true,
      spacing: 31, tilt: 15, dip: 7, fruitScale: 100,
      autoplay: true, autoEvery: 5.2,
      showBlob: true, blobWidth: 78, blobHeight: 60,
      scrollHint: 'SCROLL TO DISCOVER',
      showPrivacy: true, privacy: 'Privacy & Cookies',
      chipDiscover: 'DISCOVER', chipDrag: 'DRAG',
      startFruit: 'mango'
    },

    fruits: [
      fruit({ id: 'grapes', price: 6.9, h2: 414, label: 'Red Grapes', img: 'assets/grapes.png', h: 62, dh: 66, shape: '#E8A3B5',
        t1: 'FRESH', t2: 'RED GRAPES', left: 'Seedless | Sweet', right: 'Farm Fresh | Handpicked',
        desc: 'Plump, juicy and naturally sweet. Picked at peak ripeness for a crisp bite and a **balanced sweetness**. Rich in **antioxidants**, **vitamin C** and natural fibre.',
        note: 'Washed gently and packed with care. No wax, no added sugar.',
        tips: 'Rinse just before eating. Wonderful on cheese boards, in salads, or frozen as a refreshing summer snack. Keep refrigerated.',
        weights: '250g, 500g, 1kg, 5kg', shelf: '7–10 days' }),
      fruit({ id: 'pear', price: 4.2, h2: 350, label: 'Golden Pears', img: 'assets/pear.png', h: 56, dh: 62, shape: '#D6DD8F',
        t1: 'JUICY', t2: 'GOLDEN PEARS', left: 'Soft | Melting', right: 'Farm Fresh | Handpicked',
        desc: 'Buttery, fragrant and dripping with sweetness. Our pears are left to ripen on the tree for a **tender, juicy flesh** and a delicate, floral aroma full of **fibre** and **vitamins**.',
        note: 'Harvested by hand and sorted one by one. Naturally grown.',
        tips: 'Eat when the neck gives slightly under gentle pressure. Perfect fresh, poached, baked, or paired with blue cheese and walnuts.',
        weights: '500g, 1kg, 2kg, 5kg', shelf: '5–7 days' }),
      fruit({ id: 'banana', price: 2.5, h2: 400, label: 'Bananas', img: 'assets/banana.png', h: 62, dh: 66, shape: '#F6D55C',
        t1: 'SWEET', t2: 'BANANAS', left: 'Naturally | Energising', right: 'Farm Fresh | Handpicked',
        desc: 'Creamy, sweet and ready to eat. A natural source of **energy**, **potassium** and **vitamin B6**, the simplest, most honest snack straight from the farm.',
        note: 'Ripened gently, without artificial treatment.',
        tips: 'Enjoy on their own, sliced over breakfast, blended into smoothies, or mashed into pancakes. Keep at room temperature away from direct sun.',
        weights: '500g, 1kg, 2kg, 10kg', shelf: '3–5 days' }),
      fruit({ id: 'mango', price: 7.8, h2: 400, label: 'Sun Mango', img: 'assets/mango.png', h: 52, dh: 58, shape: '#F4A640',
        t1: 'RIPE', t2: 'SUN MANGO', left: 'Tropical | Favourite', right: 'Farm Fresh | Handpicked',
        desc: 'Sun-ripened, golden and fragrant. A **rich, honeyed sweetness** with a silky, juicy texture, loaded with **vitamin A**, **vitamin C** and natural goodness.',
        note: 'Picked at the peak of ripeness. Naturally grown, never rushed.',
        tips: 'Slice the cheeks away from the stone and scoop. Delicious fresh, in salads and salsas, or blended into lassi and smoothies.',
        weights: '500g, 1kg, 2kg, 5kg', shelf: '4–6 days' }),
      fruit({ id: 'avocado', price: 9.5, h2: 250, label: 'Green Avocado', img: 'assets/avocado.png', h: 32, dh: 36, shape: '#A9C26B',
        t1: 'CREAMY', t2: 'GREEN AVOCADO', left: 'Rich | Buttery', right: 'Farm Fresh | Handpicked',
        desc: 'Smooth, buttery and packed with **healthy fats**. Our avocados bring a **creamy, nutty richness** to every plate, full of **fibre**, **potassium** and **vitamin E**.',
        note: 'Naturally grown and carefully handled from tree to table.',
        tips: 'Ripe when the skin yields to gentle pressure. Spread on toast, mash into guacamole, slice into bowls or blend into creamy smoothies.',
        weights: '500g, 1kg, 2kg, 4kg', shelf: '3–5 days' })
    ],

    header2: {
      design: 'v1',
      menu: 'MENU', language: 'EN', languages: 'EN, FR', cart: 'CART', showLanguage: true, showCart: true,
      logoWidth: 81, red: '#E93125', disc: '#6A1728',
      ringText: 'NATURALLY GROWN - FRESH FROM NATURE -', ringSize: 150, ringSpeed: -5, ringFollow: true,
      spread: 62, radius: 580, tilt: 14, fruitSize: 100,
      showDisc: true, showArcs: true, showSparkles: true,
      autoplay: true, autoEvery: 5.2
    },

    shop: {
      enabled: true, showPrices: true, currency: '$',
      from: 'from', perUnit: 'per kg',
      addToCart: 'ADD TO CART', added: 'Added to cart',
      cartTitle: 'Your cart', empty: 'Your cart is empty. Pick something fresh!',
      subtotal: 'Subtotal', note: 'Shipping and taxes are calculated at checkout.',
      checkout: 'CHECKOUT', checkoutUrl: ''
    },

    detail: {
      headSize: 8.8, pinLength: 260, showCaptions: true, fruitShadow: true,
      rotStart: 4, rotMid: -20, rotEnd: 16,
      tipsLabel: 'SERVING TIPS', weightsLabel: 'AVAILABLE WEIGHTS', shelfLabel: 'SHELF LIFE'
    },

    gallery: {
      show: true, height: 58, gap: 1.3,
      photo: { show: true, image: 'assets/avocado.jpg' },
      video: { show: true, src: 'assets/avocado.mp4', poster: 'assets/avocado-poster.jpg' },
      cards: [
        { show: true, image: 'assets/mango.png',  caption: 'Mango',   color: '#F2B13B' },
        { show: true, image: 'assets/grapes.png', caption: 'Grapes',  color: '#631928' },
        { show: true, image: 'assets/pear.png',   caption: 'Pears',   color: '#C7D07A' },
        { show: true, image: 'assets/banana.png', caption: 'Bananas', color: '#D9391B' }
      ]
    },

    others: { show: true, line1: 'OTHER', line2: 'FRUITS', button: 'DISCOVER', columns: 4 },

    footer: {
      word1: 'ORGANAS', word2: 'Fresh Fruits', size1: 17, size2: 14.6,
      tagline: 'Fresh Fruit Growers & Suppliers', copy: '©2026 | ORGANAS',
      showEmblem: true,
      headLabel: 'HEAD OFFICE', head: '123 Orchard Street | City, Country',
      opsLabel: 'OPERATIONS', ops: 'Farm Road 45 | Region, Country',
      followLabel: 'FOLLOW US', handle: '@instagram', handleUrl: '#',
      ask: 'Have a question or want to know us better? | Write to us, we’d be happy to tell you all about the world of Organas.',
      email: 'info@organas.com', privacy: 'Privacy & Cookies'
    }
  };

  /* helpers shared by the site and the panel */
  DEF.norm = function (f) {
    return {
      show: f.show !== false, id: f.id, label: f.label, img: f.img || f.image,
      price: Number(f.price) || 0, h: f.h, dh: f.dh, h2: f.h2 || 380, shape: f.shape,
      title: [f.t1, f.t2], left: DEF.nl(f.left), right: DEF.nl(f.right),
      desc: DEF.rich(f.desc), note: f.note, tips: f.tips,
      weights: String(f.weights || '').split(',').map(s => s.trim()).filter(Boolean),
      shelf: f.shelf
    };
  };
  DEF.nl = (s) => String(s || '').split('|').map(x => x.trim()).join('\n');
  DEF.esc = (s) => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  DEF.rich = (s) => DEF.esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  window.ORG_DEFAULTS = DEF;
})();
