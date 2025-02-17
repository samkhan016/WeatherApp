export const temp = (weather: any, unit: string) => {
  if (unit === 'F') {
    return (weather * 9) / 5 + 32;
  } else {
    return weather;
  }
};
