export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: "student" | "mentor" | "admin";
  createdAt?: Date;
}

export interface IResponse {
  _id?: string;
  message: string;
  fileUrl?: string;
  respondedBy: string;
  createdAt?: Date;
}

export interface IResource {
  _id?: string;
  title: string;
  moduleCode: string;
  year: string;
  type: "paper" | "notes";
  fileUrl: string;
  fileType: "pdf" | "jpeg";
  publicId: string;
  tags: string[];
  description?: string;
  contentText?: string;
  uploadedBy: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: Date;
}

export interface IRequest {
  _id?: string;
  title: string;
  moduleCode: string;
  description: string;
  postedBy: string;
  status: "open" | "fulfilled";
  responses: IResponse[];
  createdAt?: Date;
}

export interface IMentor {
  _id?: string;
  userId: string;
  bio: string;
  modules: string[];
  status: "pending" | "approved" | "rejected";
  createdAt?: Date;
}

export interface IAppointment {
  _id?: string;
  studentId: string;
  mentorId: string;
  moduleCode: string;
  date: string;
  time: string;
  status: "booked" | "in-progress" | "completed" | "cancelled";
  createdAt?: Date;
}