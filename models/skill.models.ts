import instance from "@/utils/axios.utils";

const skill = {

  create: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `skills/`;
      instance()
        .post(url, data)
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
    return promise;
  },

  update: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `skills/${id}/`;
      instance()
        .patch(url, data)
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
    return promise;
  },

  delete: ( id) => {
    return new Promise((resolve, reject) => {
      const url = `skills/${id}/`; // id = userId

      instance()
        .delete(url)
        .then((res) => resolve(res.data))
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

export default skill;
