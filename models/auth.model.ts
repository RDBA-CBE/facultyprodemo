import instance from "@/utils/axios.utils";

const auth = {
  login: (body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/login/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  create: (body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `users/signin/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  hr_user: (body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `hr-registrations/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  change_password: (body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/change-password/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  forget_password: (body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/forgot-password/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  reset_password: (body: any,token: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/reset-password/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  verify_email: ( token: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/verify-email?token=${token}`;
      instance()
        .get(url, {})
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  profile: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/profile/`;
      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  userList: (page: any, body = {} as any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `users/?page=${page}`;
      if (body.role) {
        url = url + `&role=${body.role}`;
      }
      if (body?.search) {
        url = url + `&search=${body.search}`;
      }
      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  createUser: (body = {} as any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `users/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  updateUser: (id: any, data = {} as any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `users/${id}/`;
      instance()
        .patch(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  deleteUser: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `users/${id}/`;
      instance()
        .delete(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  logout: (body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `auth/logout/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  newsletter:  (body = {} as any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `newsletters/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },


  chatbot:  (body = {} as any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `chatbot/reply`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  chatbot_record:  (body = {} as any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `chatbot-records/`;
      instance()
        .post(url, body)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  chatbot_history:  (body = {} as any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `chatbot-records/?user_id=${body.user_id}`;
      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  delete_chatbot_history:  (body = {} as any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `chatbot-records/${body.user_id}/?user_id=${body.user_id}`;
      instance()
        .delete(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },


  
};

export default auth;
