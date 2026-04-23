window.galleryData = {
  portraits: {
    SET1: [
      "images/portraits/SET1/p1.jpg",
      "images/portraits/SET1/p2.jpg"
    ],
    SET2: [
      "images/portraits/SET2/p3.jpg",
      "images/portraits/SET2/p4.jpg",
      "images/portraits/SET2/p5.jpg",
      "images/portraits/SET2/p6.jpg"
    ],
    SET3: [
      "images/portraits/SET3/p7.jpg",
      "images/portraits/SET3/p8.jpg",
      "images/portraits/SET3/p9.jpg"
    ],
    SET4: [
      "images/portraits/SET4/p10.jpg",
      "images/portraits/SET4/p11.jpg"
    ],
    SET5: [
      "images/portraits/SET5/p12.jpg",
      "images/portraits/SET5/p13.jpg"
    ],
    SET6: [
      "images/portraits/SET6/p14.jpg",
      "images/portraits/SET6/p15.jpg"
    ],
    SET7: [
      "images/portraits/SET7/p16.jpg",
      "images/portraits/SET7/p17.jpg"
    ],
    SET8: [
      "images/portraits/SET8/p18.jpg",
      "images/portraits/SET8/p19.jpg",
      "images/portraits/SET8/p20.jpg"
    ],
    SET9: [
      "images/portraits/SET9/p21.jpg",
      "images/portraits/SET9/p22.jpg"
    ],
    SET10: [
      "images/portraits/SET10/p23.jpg",
      "images/portraits/SET10/p24.jpg"
    ]
  },
  views: {
    SET1: [
      "images/views/SET1/v1.jpg",
      "images/views/SET1/v2.jpg",
      "images/views/SET1/v3.jpg"
    ],
    SET2: [
      "images/views/SET2/v4.jpg",
      "images/views/SET2/v5.jpg",
      "images/views/SET2/v6.jpg"
    ],
    SET3: [
      "images/views/SET3/v7.jpg",
      "images/views/SET3/v8.jpg",
      "images/views/SET3/v9.jpg",
      "images/views/SET3/v10.jpg",
      "images/views/SET3/v11.jpg"
    ],
    SET4: [
      "images/views/SET4/v12.jpg",
      "images/views/SET4/v13.jpg"
    ]
  },
  details: {
    SET1: [
      "images/details/SET1/d1.jpg",
      "images/details/SET1/d2.jpg"
    ],
    SET2: [
      "images/details/SET2/d3.jpg",
      "images/details/SET2/d4.jpg",
      "images/details/SET2/d5.jpg",
      "images/details/SET2/d6.jpg"
    ],
    SET3: [
      "images/details/SET3/d7.jpg",
      "images/details/SET3/d8.jpg"
    ]
  }
};

window.contactLayouts = {
  portraits: [
    { align: "grid-left", sets: ["SET1", "SET2"] },
    { align: "grid-right", sets: ["SET3", "SET4"] },
    { align: "grid-center", sets: ["SET5", "SET6", "SET7"] },
    { align: "grid-left-soft", sets: ["SET8", "SET9"] },
    { align: "grid-right-soft", sets: ["SET10"] }
  ],
  views: [
    { align: "grid-left-soft", sets: ["SET1", "SET2"] },
    { align: "center", sets: [{ key: "SET3", chunks: [3, 2] }] },
    { align: "bottom-right", sets: ["SET4"] }
  ],
  details: [
    { align: "grid-center", sets: ["SET1"] },
    { align: "center", sets: ["SET2"] },
    { align: "grid-right-soft", sets: ["SET3"] }
  ]
};

window.freeContactLayouts = {
  portraits: {
    SET1: { x: 74, y: 78 },
    SET2: { x: 35, y: 64 },
    SET3: { x: 26, y: 64 },
    SET4: { x: 23, y: 34 },
    SET5: { x: 53, y: 16 },
    SET6: { x: 64, y: 56 },
    SET7: { x: 50, y: 33 },
    SET8: { x: 61, y: 44 },
    SET9: { x: 61, y: 8 },
    SET10: { x: 31, y: 39 }
  }
};

window.freeContactCategories = new Set(["portraits", "views", "details"]);

function isFreeContactCategory(category) {
  return window.freeContactCategories.has(category);
}

window.defaultLayoutEdits = {
  "sets": {
    "portraits.SET1.1": { "x": 405, "y": 257 },
    "portraits.SET2.1": { "x": -156, "y": 155 },
    "portraits.SET3.1": { "x": -289, "y": 155 },
    "portraits.SET4.1": { "x": -322, "y": -93 },
    "portraits.SET5.1": { "x": 144, "y": -247 },
    "portraits.SET6.1": { "x": 259, "y": 94 },
    "portraits.SET7.1": { "x": 42, "y": -104 },
    "portraits.SET8.1": { "x": 232, "y": -14 },
    "portraits.SET9.1": { "x": 182, "y": -382 },
    "portraits.SET10.1": { "x": -246, "y": -54 },
    "views.SET3.1": { "x": -109, "y": 249 },
    "views.SET3.2": { "x": -451, "y": 329 },
    "views.SET1.1": { "x": 281, "y": 169 },
    "views.SET2.1": { "x": -126, "y": 74 },
    "views.SET4.1": { "x": -83, "y": -56 },
    "details.SET3.1": { "x": -162, "y": -124 },
    "details.SET2.1": { "x": 50, "y": -34 },
    "details.SET1.1": { "x": -87, "y": 5 }
  },
  "images": {
    "portraits.SET1.1.1": { "x": 48.4467356987741, "y": 48.83950856688189, "scale": 4.95 },
    "portraits.SET1.1.2": { "x": 52.26571289995184, "y": 16.74852224505274, "scale": 3.07 },
    "portraits.SET2.1.1": { "x": 36.83545719337304, "y": 20.19080014853916, "scale": 2.13 },
    "portraits.SET2.1.2": { "x": 22.80398396612228, "y": 28.018124521467186, "scale": 2.835 },
    "portraits.SET2.1.3": { "x": 25.0839076360009, "y": 9.424472824852133, "scale": 1.7775 },
    "portraits.SET2.1.4": { "x": 13.505754953571367, "y": 10.071517140335956, "scale": 1.8950000000000002 },
    "portraits.SET3.1.1": { "x": 78.40678085204121, "y": 21.05048791063446, "scale": 3.07 },
    "portraits.SET3.1.2": { "x": 81.35318057580972, "y": 42.186724026105736, "scale": 2.3649999999999998 },
    "portraits.SET3.1.3": { "x": 92.67246480059299, "y": 27.199648572454237, "scale": 1.66 },
    "portraits.SET4.1.1": { "x": 17.461517963400283, "y": 66.61650502671698, "scale": 1.425 },
    "portraits.SET4.1.2": { "x": 26.543537966453012, "y": 50.08573332477576, "scale": 2.9525 },
    "portraits.SET5.1.1": { "x": 23.27835807260661, "y": 84.44590754515905, "scale": 2.835 },
    "portraits.SET5.1.2": { "x": 36.13356588265016, "y": 83.99099438756961, "scale": 1.8950000000000002 },
    "portraits.SET6.1.1": { "x": 51.64317282491279, "y": 86.13786733807656, "scale": 3.5400000000000005 },
    "portraits.SET6.1.2": { "x": 68.00153454546462, "y": 66.32742885971697, "scale": 2.2475 },
    "portraits.SET7.1.1": { "x": 94.47170031056747, "y": 53.730235785974415, "scale": 1.7775 },
    "portraits.SET7.1.2": { "x": 83.35177162435573, "y": 58.985303159472515, "scale": 2.13 },
    "portraits.SET8.1.1": { "x": 7.972078917912681, "y": 54.4951041860851, "scale": 1.7775 },
    "portraits.SET8.1.2": { "x": 7.5615077789046055, "y": 71.99463197037606, "scale": 1.425 },
    "portraits.SET8.1.3": { "x": 8.05686644241149, "y": 33.497133768261236, "scale": 2.13 },
    "portraits.SET9.1.1": { "x": 65.06691199164155, "y": 19.81978202784233, "scale": 1.5425 },
    "portraits.SET9.1.2": { "x": 67.83893246315264, "y": 42.34341914629665, "scale": 2.13 },
    "portraits.SET10.1.1": { "x": 68.48386411085771, "y": 86.56777943544922, "scale": 1.7775 },
    "portraits.SET10.1.2": { "x": 86.45770985718147, "y": 84.12018202626452, "scale": 4.4799999999999995 },
    "views.SET3.1.2": { "x": 20.192673678700057, "y": 21.081186214186854, "scale": 4.715 },
    "views.SET1.1.2": { "x": 46.130441652635, "y": 16.10480576393769, "scale": 3.07 },
    "views.SET1.1.1": { "x": 53.80368387612593, "y": 49.74328200062066, "scale": 5.7725 },
    "views.SET1.1.3": { "x": 45.36892073710577, "y": 83.80066778571533, "scale": 2.7175 },
    "views.SET3.1.1": { "x": 30.444294465942733, "y": 71.12441560273079, "scale": 1.3074999999999999 },
    "views.SET2.1.2": { "x": 87.04583126991756, "y": 10.80239969117545, "scale": 3.07 },
    "views.SET2.1.3": { "x": 85.976007866508, "y": 42.55868228013335, "scale": 4.245 },
    "views.SET2.1.1": { "x": 71.3203982121366, "y": 14.535995055969593, "scale": 2.6 },
    "views.SET4.1.2": { "x": 87.0765738566585, "y": 86.56897082882192, "scale": 3.775 },
    "views.SET4.1.1": { "x": 67.59511467497171, "y": 86.83753057104444, "scale": 3.305 },
    "views.SET3.1.3": { "x": 14.519363542520798, "y": 79.23117019127923, "scale": 4.245 },
    "views.SET3.1.4": { "x": 8.400135381913717, "y": 48.44896885481528, "scale": 2.835 },
    "views.SET3.1.5": { "x": 24.163208310040666, "y": 51.82062410876845, "scale": 2.3649999999999998 },
    "views.SET3.2.5": { "x": -29, "y": 53, "scale": 1.94 },
    "views.SET3.2.4": { "x": 266, "y": 40, "scale": 1.6 },
    "details.SET2.1.1": { "x": 63.41693582831617, "y": 29.14005216391301, "scale": 2.3649999999999998 },
    "details.SET2.1.4": { "x": 82.1161897156227, "y": 19.72715721395428, "scale": 3.07 },
    "details.SET1.1.1": { "x": 37.994778279761164, "y": 34.21611861742395, "scale": 6.595000000000001 },
    "details.SET1.1.2": { "x": 11.606914548135089, "y": 37.35340837669295, "scale": 2.835 },
    "details.SET2.1.3": { "x": 71.42467825066343, "y": 79.2443321363315, "scale": 4.95 },
    "details.SET3.1.1": { "x": 23.206087867763387, "y": 79.04256927913482, "scale": 3.1875 },
    "details.SET3.1.2": { "x": 44.7753061176255, "y": 79.24441435113934, "scale": 3.4225000000000003 },
    "details.SET2.1.2": { "x": 79.88003247359482, "y": 46.127523210705476, "scale": 3.6574999999999998 }
  }
};

window.defaultOpenLayoutEdits = {
  "portraits.SET1.2": { "x": -25, "y": 4, "scale": 0.59 },
  "portraits.SET1.1": { "x": -25, "y": -48, "scale": 0.767 },
  "portraits.SET2.4": { "x": 48, "y": -1, "scale": 0.69 },
  "portraits.SET2.2": { "x": -18, "y": -17, "scale": 0.8660000000000001 },
  "portraits.SET2.1": { "x": -67, "y": 13, "scale": 0.5800000000000001 },
  "portraits.SET2.3": { "x": 7, "y": 3, "scale": 0.6020000000000001 },
  "portraits.SET4.2": { "x": -17, "y": 33, "scale": 0.712 },
  "portraits.SET4.1": { "x": -19, "y": -12, "scale": 0.679 },
  "portraits.SET3.2": { "x": 55, "y": -2, "scale": 0.514 },
  "portraits.SET3.3": { "x": 13, "y": 38, "scale": 0.481 },
  "portraits.SET3.1": { "x": 72, "y": 38, "scale": 0.767 },
  "portraits.SET5.1": { "x": 44, "y": 2, "scale": 0.76 },
  "portraits.SET5.2": { "x": -8, "y": 15, "scale": 0.55 },
  "portraits.SET8.1": { "x": 16, "y": 0, "scale": 1.35 },
  "portraits.SET8.2": { "x": 143, "y": -112, "scale": 1.35 },
  "portraits.SET8.3": { "x": -126, "y": 124, "scale": 1.229 },
  "portraits.SET10.1": { "x": 35, "y": 4, "scale": 0.8440000000000001 },
  "portraits.SET10.2": { "x": -59, "y": 14, "scale": 0.635 },
  "portraits.SET7.1": { "x": -121, "y": 38, "scale": 0.877 },
  "portraits.SET7.2": { "x": 132, "y": -30, "scale": 0.668 },
  "portraits.SET6.2": { "x": -2, "y": -4, "scale": 0.5800000000000001 },
  "portraits.SET9.1": { "x": -59, "y": 115, "scale": 1.1300000000000001 },
  "portraits.SET9.2": { "x": 4, "y": -80, "scale": 0.79 },
  "views.SET3.4": { "x": -131, "y": 123, "scale": 1.229 },
  "views.SET3.5": { "x": 212, "y": -48, "scale": 1.35 },
  "views.SET3.2": { "x": -47, "y": 82, "scale": 1.009 },
  "views.SET1.1": { "x": -77, "y": 29, "scale": 0.9540000000000001 },
  "views.SET1.3": { "x": -281, "y": -186, "scale": 0.888 },
  "views.SET1.2": { "x": 335, "y": 233, "scale": 0.8440000000000001 },
  "views.SET2.1": { "x": -65, "y": 150, "scale": 0.778 },
  "views.SET2.2": { "x": -172, "y": 44, "scale": 0.93 },
  "views.SET2.3": { "x": 57, "y": -45, "scale": 0.7 },
  "views.SET4.1": { "x": 86, "y": 9, "scale": 0.547 },
  "views.SET4.2": { "x": -81, "y": 4, "scale": 0.51 },
  "details.SET1.2": { "x": 94, "y": -4, "scale": 0.65 },
  "details.SET1.1": { "x": -115, "y": 16, "scale": 0.42600000000000005 },
  "details.SET3.2": { "x": -62, "y": 6, "scale": 0.811 },
  "details.SET3.1": { "x": 66, "y": 9, "scale": 0.7560000000000001 },
  "details.SET2.4": { "x": -41, "y": 76, "scale": 1.1960000000000002 },
  "details.SET2.2": { "x": 30, "y": 87, "scale": 1.0750000000000002 },
  "details.SET2.1": { "x": -21, "y": 15, "scale": 0.8 },
  "details.SET2.3": { "x": -184, "y": -97, "scale": 0.921 },
  "portraits.SET6.1": { "x": 61, "y": -25, "scale": 0.767 },
  "views.SET3.1": { "x": 124, "y": -17, "scale": 1.284 },
  "views.SET3.3": { "x": 80, "y": -38, "scale": 0.888 }
};
