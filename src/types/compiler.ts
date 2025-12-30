export default interface AddSubmissionDTO{
    sourceCode: Record<string,string>,
    namesOfFiles: string[]
    userId: string,
    problemId: string
}