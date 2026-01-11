import { Problem } from "../../types/models";

export class CalculateNumSub {
  execute(problems: Problem[]): number {
    const total = problems.reduce((accumulator, currentProblem) => {
      const submissionsCount = currentProblem.problemSubmissions?.length || 0;
      return accumulator + submissionsCount;
    }, 0);

    return total;
  }
}