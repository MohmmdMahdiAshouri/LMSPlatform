export class CreateSchoolCommand {
    constructor(
        public readonly userId: string,
        public readonly name: string,
    ) {}
}
