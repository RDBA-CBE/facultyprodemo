import instance from "@/utils/axios.utils";

const applications = {
  create: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `applications/`;
      instance()
        .post(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  update: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `applications/${id}/`;
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

  list: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `applications/my-applications/`;

      instance()
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
    return promise;
  },

  interview_feedback: (hashtoken: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `interview-slots/hashtokenpanel/${hashtoken}`;

      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  create_interview_feedback: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `interview-feedbacks/`;
      instance()
        .post(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  get_applicant_feedback: (hashtoken: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `interview-slots/`;
      url += `hashtoken/${hashtoken}`;
      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  create_applicant_feedback: (data,hashtoken: any) => {
console.log('✌️hashtoken --->', hashtoken);
    let promise = new Promise((resolve, reject) => {
      let url = `interview-slots/`;
      url += `hashtoken/${hashtoken}/submit-feedback`;

      instance()
        .post(url,data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  application_status: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `application-statuses/`;

      instance()
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
    return promise;
  },
  
};
export default applications;
