const carouselData = [
  {
    id: 1,
    dmks: [
      { color: "#ff0000", backgroundColor: "#ffffff", size: 1, content: "好可愛的貓貓！" },
      { color: "#0000ff", backgroundColor: "#f0f0f0", size: 2, content: "這隻貓的眼神好炯炯有神" },
      { color: "#008000", backgroundColor: "#fff0f0", size: 0, content: "貓咪很靜" },
      { color: "#ff00ff", backgroundColor: "#f0fff0", size: 1, content: "這是什麼品種？" },
      { color: "#800080", backgroundColor: "#fafafa", size: 2, content: "可愛的表情" },
      { color: "#ffa500", backgroundColor: "#f0e68c", size: 0, content: "貓咪真療癒" }
    ]
  },
  {
    id: 2,
    dmks: [
      { color: "#ff1493", backgroundColor: "#e6e6fa", size: 1, content: "這是白貓！" },
      { color: "#000080", backgroundColor: "#f5f5f5", size: 2, content: "白貓是真的圓嘟嘟的~" },
      { color: "#ffa500", backgroundColor: "#ffefd5", size: 0, content: "白貓太可愛了！" },
      { color: "#008080", backgroundColor: "#ffdab9", size: 1, content: "牠看起來好懶" },
      { color: "#ffd700", backgroundColor: "#fafad2", size: 2, content: "貓咪真的可愛" },
      { color: "#ff69b4", backgroundColor: "#fffacd", size: 0, content: "眼神好迷人" }
    ]
  },
  {
    id: 3,
    dmks: [
      { color: "#7feeaa", backgroundColor: "#ffffff", size: 2, content: "白貓好像天使！" },
      { color: "#ff4500", backgroundColor: "#fafafa", size: 1, content: "牠是想吃罐頭嗎？" },
      { color: "#2e8b57", backgroundColor: "#f0fff0", size: 0, content: "這個動作好可愛" },
      { color: "#4682b4", backgroundColor: "#fff5ee", size: 2, content: "白貓好溫柔" },
      { color: "#6a5acd", backgroundColor: "#f8f8ff", size: 1, content: "這隻貓看起來好乖" },
      { color: "#ff6347", backgroundColor: "#fffaf0", size: 0, content: "白貓真的很美" }
    ]
  },
  {
    id: 4,
    dmks: [
      { color: "#ff4500", backgroundColor: "#f5fffa", size: 1, content: "這隻貓看起來悠閒" },
      { color: "#2e8b57", backgroundColor: "#ffffe0", size: 2, content: "活動一下筋骨" },
      { color: "#ff8c00", backgroundColor: "#fffacd", size: 0, content: "牠真有氣質" },
      { color: "#8a2be2", backgroundColor: "#fafad2", size: 1, content: "貓咪的毛色很漂亮" },
      { color: "#4682b4", backgroundColor: "#fffff0", size: 2, content: "伸懶腰放鬆~" },
      { color: "#32cd32", backgroundColor: "#f0e68c", size: 0, content: "我想休息了" }
    ]
  },
  {
    id: 5,
    dmks: [
      { color: "#8b0000", backgroundColor: "#f5f5dc", size: 1, content: "喵~ 喵~" },
      { color: "#7cfc00", backgroundColor: "#fdf5e6", size: 2, content: "這隻貓在幹嘛？" },
      { color: "#9932cc", backgroundColor: "#fff0f5", size: 0, content: "牠好像很專心" },
      { color: "#6495ed", backgroundColor: "#ffe4e1", size: 1, content: "這隻貓在思考" },
      { color: "#8b008b", backgroundColor: "#fff8dc", size: 2, content: "好可愛的姿勢" },
      { color: "#ff4500", backgroundColor: "#faebd7", size: 0, content: "貓咪好靜" }
    ]
  },
  {
    id: 6,
    dmks: [
      { color: "#d2691e", backgroundColor: "#f5fffa", size: 1, content: "貓咪與紙箱天生一對" },
      { color: "#ff00ff", backgroundColor: "#fafafa", size: 2, content: "牠好像在睡覺" },
      { color: "#8a2be2", backgroundColor: "#fff5ee", size: 0, content: "貓咪真的很喜歡紙箱" },
      { color: "#8a2be2", backgroundColor: "#fff5ee", size: 0, content: "ㄜ?所以紙箱咧?" },
      { color: "#44ff00", backgroundColor: "#ffefd5", size: 1, content: "牠看起來好舒服" },
      { color: "#ff4500", backgroundColor: "#fafad2", size: 2, content: "這個動作好療癒" },
      { color: "#8b0000", backgroundColor: "#f8f8ff", size: 0, content: "貓咪很香" }
    ]
  },
  {
    id: 7,
    dmks: [
      { color: "#88ff99", backgroundColor: "#fff8dc", size: 1, content: "這個是布偶貓嗎？" },
      { color: "#ff00ff", backgroundColor: "#fafafa", size: 2, content: "好想抱抱牠" },
      { color: "#00ff77", backgroundColor: "#faf0e6", size: 0, content: "牠看起來好柔軟" },
      { color: "#ff4500", backgroundColor: "#f0fff0", size: 1, content: "布偶貓真的好美" },
      { color: "#8b0000", backgroundColor: "#fffaf0", size: 2, content: "這隻貓看起來好乖" },
      { color: "#ffd700", backgroundColor: "#fffacd", size: 0, content: "真的很可愛" }
    ]
  },
  {
    id: 8,
    dmks: [
      { color: "#ff1493", backgroundColor: "#f5f5f5", size: 1, content: "貓咪的眼睛好漂亮" },
      { color: "#0000ff", backgroundColor: "#fafafa", size: 2, content: "好療癒的表情" },
      { color: "#008000", backgroundColor: "#ffefd5", size: 0, content: "眼睛閃閃發亮" },
      { color: "#ff4500", backgroundColor: "#f8f8ff", size: 1, content: "這隻貓看起來好聰明" },
      { color: "#8b0000", backgroundColor: "#ffdab9", size: 2, content: "眼神好可愛" },
      { color: "#4682b4", backgroundColor: "#f0fff0", size: 0, content: "貓咪的眼睛太美了" }
    ]
  },
  {
    id: 9,
    dmks: [
      { color: "#ff4500", backgroundColor: "#faf0e6", size: 1, content: "這隻貓咪太可愛了！" },
      { color: "#8a2be2", backgroundColor: "#fafad2", size: 2, content: "牠好像在看我" },
      { color: "#000080", backgroundColor: "#f0e68c", size: 0, content: "牠眼神好迷人" },
      { color: "#ff8c00", backgroundColor: "#f8f8ff", size: 1, content: "牠真有靈氣" },
      { color: "#ff00ff", backgroundColor: "#fafafa", size: 2, content: "貓咪太萌了" },
      { color: "#32cd32", backgroundColor: "#f5f5dc", size: 0, content: "太可愛了！" }
    ]
  }
];

export default carouselData;
