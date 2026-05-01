import { Injectable } from "@nestjs/common";
import { IssueRepository } from "./repositories";

@Injectable()
export class IssueService {
    constructor(private readonly issueRepository:IssueRepository){}
}