type CountryApiResult = {
  currencies: Record<string, unknown>;
  flag: string;
};

export const getDestinationInfo = async (countryName: string) => {
  let response: Response;

  try {
    response = await fetch(
      `https://restcountries.com/v3.1/name/${countryName}`,
    );
  } catch {
    throw new Error("Network error: could not reach the countries API");
  }

  if (!response.ok) {
    throw new Error(`Country "${countryName}" not found`);
  }

  const data = await response.json() as CountryApiResult[];

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No results found for "${countryName}"`);
  }

  const currencies = Object.keys(data[0].currencies);
  if (currencies.length === 0) {
    throw new Error(`No currency data available for "${countryName}"`);
  }

  return {
    currency: currencies[0],
    flag: data[0].flag,
  };
};
