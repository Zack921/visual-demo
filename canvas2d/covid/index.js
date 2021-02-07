const canvas = document.querySelector("canvas");
const width = canvas.width;
const height = canvas.height;
const ctx = canvas.getContext("2d");
ctx.fillStyle = "black";

(async function () {
  // 预处理数据
  const worldData = await (await fetch('./assets/world-geojson.json')).json();
  const covidData = await (await fetch("./assets/covid-data.json")).json();
  mapDataToCountries(worldData, covidData);

  const startDate = new Date("2020/01/22");
  let i = 0;
  const timer = setInterval(() => {
    const date = new Date(startDate.getTime() + 86400000 * ++i);
    drawMap(ctx, worldData, date);
    if (date.getTime() + 86400000 > new Date('2020-03-20')) {
      clearInterval(timer);
    }
  }, 100);
})();

// 将疫情数据绑定到地图数据上
function mapDataToCountries(geoData, covidData) {
  const covidDataMap = {};
  covidData.dailyReports.forEach((d) => {
    const date = d.updatedDate;
    const countries = d.countries;
    countries.forEach((country) => {
      const name = country.country;
      covidDataMap[name] = covidDataMap[name] || {};
      covidDataMap[name][date] = country;
    });
  });
  geoData.features.forEach((d) => {
    const name = d.properties.name;
    d.properties.covid = covidDataMap[name];
  });
}

// 经纬度 投射到 坐标轴
function projection([longitude, latitude]) { // 东经为正 西经为负，北纬为正 南纬为负
  const x = (width / 360) * (180 + longitude); // 经度 -> x轴
  let y = 0;
  if (latitude >= 0) {
    y = (height / 180) * (90 - latitude);
  } else {
    y = (height / 180) * (90 + Math.abs(latitude));
  }
  return [x, y];
}

function formatDate(date) {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  month = month > 9 ? month : `0${month}`;
  let day = date.getDate();
  day = day > 9 ? day : `0${day}`;
  return `${year}-${month}-${day}`;
}

// 根据疫情确诊人数显示地区颜色
function mapColor(confirmed) {
  if (!confirmed) {
    return "#3ac";
  }
  if (confirmed < 10) {
    return "rgb(250, 247, 171)";
  }
  if (confirmed < 100) {
    return "rgb(255, 186, 66)";
  }
  if (confirmed < 500) {
    return "rgb(234, 110, 41)";
  }
  if (confirmed < 1000) {
    return "rgb(224, 81, 57)";
  }
  if (confirmed < 10000) {
    return "rgb(192, 50, 39)";
  }
  return "rgb(151, 32, 19)";
}

function drawPoints(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(...points[i]);
  }
  ctx.fill();
}

function drawMap(ctx, worldData, date) {
  date = formatDate(date);
  dateInfo.innerHTML = `世界新冠疫情: ${date}`;

  const features = worldData.features; // 特征对象集
  features.forEach(feature => {

    const covid = feature.properties.covid ? feature.properties.covid[date] : null;
    let confirmed;
    if (covid) {
      confirmed = covid.confirmed;
    }
    ctx.fillStyle = mapColor(confirmed);

    if (feature.geometry.type === 'Polygon') { // 多边形
      const coordinates = feature.geometry.coordinates;
      if (coordinates) {
        coordinates.forEach(path => {
          const points = path.map(projection);
          drawPoints(ctx, points);
        });
      }
    } else if (feature.geometry.type === 'MultiPolygon') { // 多个多边形
      const polygons = feature.geometry.coordinates;
      if (polygons) {
        polygons.forEach(polygon => {
          if (polygon) {
            polygon.forEach(path => {
              const points = path.map(projection);
              drawPoints(ctx, points);
            });
          }
        });
      }
    }
  });
}