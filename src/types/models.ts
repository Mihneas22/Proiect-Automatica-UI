export interface Problem {
  problemId: string;
  name: string;
  lab: string;
  tags: string[];
  content: string;
  requests: string[];
  points: number;
  inputsJson: string[];
  outputsJson: string[];
  acceptanceRate: number;
  problemSubmissions: Submission[];
  createdAt: Date;
}

export interface Submission{
  submissionId: string;
  userId: string;
  user: User;
  problemId: string;
  problem: Problem;
  content: string;
  status: string;
  message: string;
  submittedAt: Date;
}

export interface User{
  id: string;
  username: string;
  email: string;
  password: string;
  userSubmissions: Submission[];
  createdAt: Date;
}
