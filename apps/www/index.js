const fetchWeatherApiResponse = async () => {
  const response = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    authSig: null,
    chain: 'ethereum',
  });

  const apiKey = JSON.parse(response.response).apiKey;
  const url =
    'https://api.weatherapi.com/v1/current.json?key=' + apiKey + '&q=' + city;

  const data = await fetch(url).then((response) => response.json());
  const temp = String(parseInt(data.current.temp_c));
  Lit.Actions.setResponse({ result: temp });
};

fetchWeatherApiResponse();
