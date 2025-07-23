const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const checkNetwork = () => {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType;
        resolve(networkType !== 'none');
      },
      fail() {
        resolve(false);
      }
    });
  });
}

module.exports = {
  formatTime,
  checkNetwork
}