import instance from "@/utils/axios.utils";


const department = {
  list: (data=null) => {
    let promise = new Promise((resolve, reject) => {
      let url = `departments/`;
      if (data?.pagination == "No") {
        url += `?pagination=${encodeURIComponent(false)}`;
      }
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

 masterDep: (data: any = {}) => {
  return new Promise((resolve, reject) => {
    let url = `department-masters/?ordering=asc`;

    // ✅ add page support
    if (data?.page) {
      url += `&page=${data.page}`;
    }
     if (data?.has_jobs) {
      url += `&has_job=${data.has_jobs}`;
    }

    instance()
      .get(url)
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

acadamicRes: (data: any = {}) => {
  return new Promise((resolve, reject) => {
    let url = `additional-academic-responsibilities/?ordering=asc`;

    // ✅ add page support
    if (data?.page) {
      url += `&page=${data.page}`;
    }
     

    instance()
      .get(url)
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

  depdetails: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `departments/${id}/`;
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

  create: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `job-locations/`;
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
      let url = `job-locations/${id}/`;
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

  delete: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `job-locations/${id}/`;
      instance()
        .delete(url)
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

  details: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `job-categories/${id}/`;
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

export default department;