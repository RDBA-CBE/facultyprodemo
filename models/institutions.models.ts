import instance from "@/utils/axios.utils";
import axiosWithoutToken from "@/utils/axiosWithoutToken";

const institutions = {
  list: () => {
    return new Promise((resolve, reject) => {
      const url = `institutions/`;

      axiosWithoutToken()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.message);
          } else {
            reject(error);
          }
        });
    });
  },
};

export default institutions;
