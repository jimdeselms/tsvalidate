export type ValidationResult = {
    status: "ok" | "fail"
}

export type Validator = (obj: any) => ValidationResult