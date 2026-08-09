function generateHash(length: number) {
  return Array.from(Array(length), () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export function handleContent(text: string) {
  let result = text.replace(
    /体育/g,
    "体<span style='font-size:0;line-height:0;letter-spacing:0'>" + generateHash(8) + '</span>育',
  );
  result = result.replace(
    /娱乐/g,
    "娱<span style='font-size:0;line-height:0;letter-spacing:0'>" + generateHash(8) + '</span>乐',
  );
  result = result.replace(
    /投注/g,
    "投<span style='font-size:0;line-height:0;letter-spacing:0'>" + generateHash(8) + '</span>注',
  );
  result = result.replace(
    /易倍/g,
    "易<span style='font-size:0;line-height:0;letter-spacing:0'>" + generateHash(8) + '</span>倍',
  );
  result = result.replace(
    /返水/g,
    "返<span style='font-size:0;line-height:0;letter-spacing:0'>" + generateHash(8) + '</span>水',
  );
  result = result.replace(
    /EMC/g,
    "E<span style='font-size:0;line-height:0;letter-spacing:0'>" +
      generateHash(8) +
      "</span>M<span style='font-size:0;line-height:0;letter-spacing:0'>" +
      generateHash(8) +
      '</span>C',
  );
  result = result.replace(
    /彩金/g,
    "彩<span style='font-size:0;line-height:0;letter-spacing:0'>" + generateHash(8) + '</span>金',
  );
  result = result.replace(
    /充值/g,
    "充<span style='font-size:0;line-height:0;letter-spacing:0'>" + generateHash(8) + '</span>值',
  );
  result = result.replace(
    /CME/g,
    "C<span style='font-size:0;line-height:0;letter-spacing:0'>" +
      generateHash(8) +
      "</span>M<span style='font-size:0;line-height:0;letter-spacing:0'>" +
      generateHash(8) +
      '</span>E',
  );
  result = result.replace(
    /OP7/g,
    "O<span style='font-size:0;line-height:0;letter-spacing:0'>" +
      generateHash(8) +
      "</span>P<span style='font-size:0;line-height:0;letter-spacing:0'>" +
      generateHash(8) +
      '</span>7',
  );
  result = result.replace(
    /OP/g,
    "O<span style='font-size:0;line-height:0;letter-spacing:0'>" + generateHash(8) + '</span>P',
  );
  return result;
}
