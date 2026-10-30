// Màu biểu đồ (recharts vẽ SVG nên cần giá trị hex theo từng chế độ),
// đồng bộ với bảng màu trong styles/index.css.
const LIGHT = {
  primary: "#82641a",
  secondary: "#2f6168",
  grid: "#e3dccd",
  text: "#1e2229",
  tooltip: "#ffffff",
  tooltipBorder: "#d8d0c1",
  bars: ["#a8832f", "#2f6168", "#3b5c8f", "#5f9170", "#7d5fa0", "#c2764a"],
};

const DARK = {
  primary: "#ddb968",
  secondary: "#8ec5be",
  grid: "#2a3240",
  text: "#ece8df",
  tooltip: "#1d2430",
  tooltipBorder: "#2e3745",
  bars: ["#ddb968", "#8ec5be", "#a5beeb", "#8fc7a0", "#b9a0da", "#e0996f"],
};

export const getChartColors = (isDarkMode) => (isDarkMode ? DARK : LIGHT);
