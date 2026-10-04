/*
 * EASY-EDIT DATA FILE
 * Update the fair/festival list and gallery photos here — no HTML needed.
 * To add a photo: drop it in /public/images/gallery/ and add a line below.
 */
window.SITE_DATA = {
  // Places Jeff's trucks regularly show up. Edit freely each season.
  stops: [
    { name: 'Lisbon Street home base', where: 'Lewiston · Tue–Sun' },
    { name: 'Main Street by the mill', where: 'Lewiston · Fridays' },
    { name: 'Food truck park', where: 'Waterville' },
    { name: 'Cumberland Fair', where: 'Cumberland' },
    { name: 'Oxford County Fair', where: 'Oxford' },
    { name: 'Farmington Fair', where: 'Farmington' },
    { name: 'Litchfield Fair', where: 'Litchfield' },
    { name: 'Reggae Fest', where: 'Sugarloaf' },
    { name: 'RiverFest & Liberty Fest', where: 'Lewiston-Auburn' }
  ],

  // Gallery photos (shown in this order). "wide: true" makes a photo span two columns.
  gallery: [
    { src: '/images/gallery/plate-rice-peas.jpg', alt: 'Glazed chicken with rice and peas and steamed cabbage', wide: true },
    { src: '/images/gallery/jerk-yellow-rice.jpg', alt: 'Charred jerk meat over yellow rice with a scotch bonnet pepper' },
    { src: '/images/gallery/tofu-salad.jpg', alt: 'Jerk tofu salad at the truck window' },
    { src: '/images/gallery/truck-day-tight.jpg', alt: "Jeff's Jamaican Cuisine truck with the Jamaican flag" },
    { src: '/images/gallery/oxtail.jpg', alt: 'Oxtail and rice with a Ting soda' }
  ]
};
