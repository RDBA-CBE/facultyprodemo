import { Phone } from "lucide-react";
import * as Yup from "yup";

export const jobApplicationSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .min(10, "Phone number must be at least 10 digits"),
  experience: Yup.string().required("Experience is required"),

  resume: Yup.mixed()
    .required("Resume is required")
    .test(
      "fileType",
      "Only PDF and DOC/DOCX files are allowed",
      (value: any) => {
        if (!value) return false;
        const allowedTypes: any = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        return allowedTypes.includes(value.type);
      }
    )
    .test("fileSize", "File size must be less than 12MB", (value: any) => {
      if (!value) return false;
      return value.size <= 12 * 1024 * 1024;
    }),
});

export const login = Yup.object().shape({
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const register = Yup.object().shape({
  first_name: Yup.string().required("First Name is required"),
  last_name: Yup.string().required("Last Name is required"),
  email: Yup.string().required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  password_confirm: Yup.string()
    .required("Password Confirm is required")
    .min(8, "Confirm Password must be at least 8 characters")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

export const user = Yup.object().shape({
  first_name: Yup.string().required("First Name is required"),
  last_name: Yup.string().required("Last Name is required"),
  email: Yup.string().required("Email is required"),
  phone: Yup.string()
  .required("Phone number is required")
  .min(10, "Phone number must be at least 10 digits")
  .max(12, "Phone number must not exceed 10 digits"),
  current_location: Yup.string().required(" Location is required"),
  experience: Yup.string().required("Experience is required"),
  gender: Yup.string().required("Gender is required"),
});

export const userResume = Yup.object({
  resume: Yup.mixed()
    .required("Resume is required")
    .test(
      "fileValidation",
      "Only PDF/DOC/DOCX files under 12MB are allowed",
      (file: any) =>
        file &&
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type) &&
        file.size <= 12 * 1024 * 1024
    ),
});

export const changePassword = Yup.object().shape({
  current_password: Yup.string().required("Current Password is required"),
  new_password: Yup.string().required("New Password is required"),
  confirm_password: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("new_password")], "Passwords must match"),
});

export const forgotPassword = Yup.object().shape({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
});

export const resetPassword = Yup.object().shape({
  new_password: Yup.string().required("New Password is required"),
  confirm_password: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("new_password")], "Passwords must match"),
});

export const interview_feedback = Yup.object().shape({
  score: Yup.string().required("Score is required"),
  feedback_text: Yup.string().required("Feedback is required"),
});

export const applicant_feedback = Yup.object().shape({
  availabilityNote: Yup.string().when("isAvailable", {
    is: "No",
    then: (schema) => schema.required("Available time is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});


export const hrRegistrationSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required"),

  email: Yup.string()
    .required("Email is required")
    .email("Enter a valid email address"),

  institution: Yup.string()
    .required("Institution is required"),

  college: Yup.string()
    .required("College is required"),

  phone: Yup.string()
    .required("Phone number is required")
    .min(10, "Phone number must be at least 10 digits")
    .max(12, "Phone number must not exceed 10 digits"),

  // password: Yup.string()
  //   .required("Password is required")
  //   .min(6, "Password must be at least 6 characters"),

  // confirm_password: Yup.string()
  //   .required("Confirm Password is required")
  //   .oneOf([Yup.ref("password")], "Passwords must match"),
});

export const deleteAccountSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  phone: Yup.string()
  .required("Phone number is required")
  .min(10, "Phone number must be at least 10 digits")
  .max(12, "Phone number must not exceed 10 digits"),
  reason_text: Yup.string().required("Reason is required"),
});