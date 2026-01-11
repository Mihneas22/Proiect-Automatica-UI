import { Problem } from "../../types/models";

export class CalculateAverageAcc {
  execute(problems: Problem[]): number {
    if (!problems || problems.length === 0) {
      return 0;
    }

    const sum = problems.reduce((accumulator, currentProblem) => {
      const rate = currentProblem.acceptanceRate || 0;
      return accumulator + rate;
    }, 0);

    const average = sum / problems.length;
    return Math.round(average * 100) / 100;
  }
}