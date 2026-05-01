import { Controller } from "@nestjs/common";
import { IssueService } from "./issue.service";

@Controller()
export class IssueController{
    constructor(private readonly issueService:IssueService){}
}