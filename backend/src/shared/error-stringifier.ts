import { AxiosError } from "axios";

export const stringifyError = (error: AxiosError) => {
  if (error.response) {
    return JSON.stringify(error.response.data) + " | " + error.stack;
  } else if (error.toJSON) {
    return JSON.stringify(error.toJSON());
  } else {
    return String(error);
  }
};
