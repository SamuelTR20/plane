// types
import { IAnalyticsParams, IJiraMetadata, INotificationParams } from "@plane/types";
// helpers
import { objToQueryParams } from "@/helpers/string.helper";

const paramsToKey = (params: any) => {
  const {
    state,
    state_group,
    priority,
    mentions,
    assignees,
    created_by,
    labels,
    start_date,
    target_date,
    sub_issue,
    project,
    layout,
    subscriber,
  } = params;

  let projectKey = project ? project.split(",") : [];
  let stateKey = state ? state.split(",") : [];
  let stateGroupKey = state_group ? state_group.split(",") : [];
  let priorityKey = priority ? priority.split(",") : [];
  let mentionsKey = mentions ? mentions.split(",") : [];
  let assigneesKey = assignees ? assignees.split(",") : [];
  let createdByKey = created_by ? created_by.split(",") : [];
  let labelsKey = labels ? labels.split(",") : [];
  let subscriberKey = subscriber ? subscriber.split(",") : [];
  const startDateKey = start_date ?? "";
  const targetDateKey = target_date ?? "";
  const type = params.type ? params.type.toUpperCase() : "NULL";
  const groupBy = params.group_by ? params.group_by.toUpperCase() : "NULL";
  const orderBy = params.order_by ? params.order_by.toUpperCase() : "NULL";
  const layoutKey = layout ? layout.toUpperCase() : "";

  // sorting each keys in ascending order
  projectKey = projectKey.sort().join("_");
  stateKey = stateKey.sort().join("_");
  stateGroupKey = stateGroupKey.sort().join("_");
  priorityKey = priorityKey.sort().join("_");
  assigneesKey = assigneesKey.sort().join("_");
  mentionsKey = mentionsKey.sort().join("_");
  createdByKey = createdByKey.sort().join("_");
  labelsKey = labelsKey.sort().join("_");
  subscriberKey = subscriberKey.sort().join("_");

  return `${layoutKey}_${projectKey}_${stateGroupKey}_${stateKey}_${priorityKey}_${assigneesKey}_${mentionsKey}_${createdByKey}_${type}_${groupBy}_${orderBy}_${labelsKey}_${startDateKey}_${targetDateKey}_${sub_issue}_${subscriberKey}`;
};

export const CURRENT_USER = "CURRENT_USER";
export const USER_WORKSPACE_INVITATIONS = "USER_WORKSPACE_INVITATIONS";
export const USER_WORKSPACES = "USER_WORKSPACES";

export const WORKSPACE_DETAILS = (workspaceSlug: string) => `WORKSPACE_DETAILS_${workspaceSlug.toUpperCase()}`;

export const WORKSPACE_MEMBERS = (workspaceSlug: string) => `WORKSPACE_MEMBERS_${workspaceSlug.toUpperCase()}`;
export const WORKSPACE_INVITATIONS = (workspaceSlug: string) => `WORKSPACE_INVITATIONS_${workspaceSlug.toString()}`;
export const WORKSPACE_INVITATION = (invitationId: string) => `WORKSPACE_INVITATION_${invitationId}`;

export const PROJECT_DETAILS = (projectId: string) => `PROJECT_DETAILS_${projectId.toUpperCase()}`;

export const PROJECT_MEMBERS = (projectId: string) => `PROJECT_MEMBERS_${projectId.toUpperCase()}`;

export const PROJECT_ISSUES_LIST = (workspaceSlug: string, projectId: string) =>
  `PROJECT_ISSUES_LIST_${workspaceSlug.toUpperCase()}_${projectId.toUpperCase()}`;

export const PROJECT_GITHUB_REPOSITORY = (projectId: string) => `PROJECT_GITHUB_REPOSITORY_${projectId.toUpperCase()}`;

// cycles
export const CYCLE_ISSUES_WITH_PARAMS = (cycleId: string, params?: any) => {
  if (!params) return `CYCLE_ISSUES_WITH_PARAMS_${cycleId.toUpperCase()}`;

  const paramsKey = paramsToKey(params);

  return `CYCLE_ISSUES_WITH_PARAMS_${cycleId.toUpperCase()}_${paramsKey.toUpperCase()}`;
};
export const CYCLE_DETAILS = (cycleId: string) => `CYCLE_DETAILS_${cycleId.toUpperCase()}`;

export const STATES_LIST = (projectId: string) => `STATES_LIST_${projectId.toUpperCase()}`;

export const USER_ACTIVITY = (params: { cursor?: string }) => `USER_ACTIVITY_${params?.cursor}`;

// Issues
export const ISSUE_DETAILS = (issueId: string) => `ISSUE_DETAILS_${issueId.toUpperCase()}`;

// integrations
export const APP_INTEGRATIONS = "APP_INTEGRATIONS";
export const WORKSPACE_INTEGRATIONS = (workspaceSlug: string) =>
  `WORKSPACE_INTEGRATIONS_${workspaceSlug.toUpperCase()}`;

export const JIRA_IMPORTER_DETAIL = (workspaceSlug: string, params: IJiraMetadata) => {
  const { api_token, cloud_hostname, email, project_key } = params;

  return `JIRA_IMPORTER_DETAIL_${workspaceSlug.toUpperCase()}_${api_token}_${cloud_hostname}_${email}_${project_key}`;
};

//import-export
export const IMPORTER_SERVICES_LIST = (workspaceSlug: string) =>
  `IMPORTER_SERVICES_LIST_${workspaceSlug.toUpperCase()}`;

//export
export const EXPORT_SERVICES_LIST = (workspaceSlug: string, cursor: string, per_page: string) =>
  `EXPORTER_SERVICES_LIST_${workspaceSlug.toUpperCase()}_${cursor.toUpperCase()}_${per_page.toUpperCase()}`;

// github-importer
export const GITHUB_REPOSITORY_INFO = (workspaceSlug: string, repoName: string) =>
  `GITHUB_REPO_INFO_${workspaceSlug.toString().toUpperCase()}_${repoName.toUpperCase()}`;

// slack-project-integration
export const SLACK_CHANNEL_INFO = (workspaceSlug: string, projectId: string) =>
  `SLACK_CHANNEL_INFO_${workspaceSlug.toString().toUpperCase()}_${projectId.toUpperCase()}`;

// analytics
export const ANALYTICS = (workspaceSlug: string, params: IAnalyticsParams) =>
  `ANALYTICS${workspaceSlug.toUpperCase()}_${params.x_axis}_${params.y_axis}_${
    params.segment
  }_${params.project?.toString()}`;
export const DEFAULT_ANALYTICS = (workspaceSlug: string, params?: Partial<IAnalyticsParams>) =>
  `DEFAULT_ANALYTICS_${workspaceSlug.toUpperCase()}_${params?.project?.toString()}_${params?.cycle}_${params?.module}`;

// notifications
export const USER_WORKSPACE_NOTIFICATIONS = (workspaceSlug: string, params: INotificationParams) => {
  const { type, snoozed, archived, read } = params;

  return `USER_WORKSPACE_NOTIFICATIONS_${workspaceSlug?.toUpperCase()}_TYPE_${(
    type ?? "assigned"
  )?.toUpperCase()}_SNOOZED_${snoozed}_ARCHIVED_${archived}_READ_${read}`;
};

export const UNREAD_NOTIFICATIONS_COUNT = (workspaceSlug: string) =>
  `UNREAD_NOTIFICATIONS_COUNT_${workspaceSlug?.toUpperCase()}`;

export const getPaginatedNotificationKey = (index: number, prevData: any, workspaceSlug: string, params: any) => {
  if (prevData && !prevData?.results?.length) return null;

  if (index === 0)
    return `/api/workspaces/${workspaceSlug}/users/notifications?${objToQueryParams({
      ...params,
      cursor: "30:0:0",
    })}`;

  const cursor = prevData?.next_cursor;
  const nextPageResults = prevData?.next_page_results;

  if (!nextPageResults) return null;

  return `/api/workspaces/${workspaceSlug}/users/notifications?${objToQueryParams({
    ...params,
    cursor,
  })}`;
};

// profile
export const USER_PROFILE_DATA = (workspaceSlug: string, userId: string) =>
  `USER_PROFILE_ACTIVITY_${workspaceSlug.toUpperCase()}_${userId.toUpperCase()}`;
export const USER_PROFILE_ACTIVITY = (
  workspaceSlug: string,
  userId: string,
  params: {
    cursor?: string;
  }
) => `USER_WORKSPACE_PROFILE_ACTIVITY_${workspaceSlug.toUpperCase()}_${userId.toUpperCase()}_${params?.cursor}`;
export const USER_PROFILE_PROJECT_SEGREGATION = (workspaceSlug: string, userId: string) =>
  `USER_PROFILE_PROJECT_SEGREGATION_${workspaceSlug.toUpperCase()}_${userId.toUpperCase()}`;

// reactions
export const COMMENT_REACTION_LIST = (workspaceSlug: string, projectId: string, commendId: string) =>
  `COMMENT_REACTION_LIST_${workspaceSlug.toUpperCase()}_${projectId.toUpperCase()}_${commendId.toUpperCase()}`;

// api-tokens
export const API_TOKENS_LIST = (workspaceSlug: string) => `API_TOKENS_LIST_${workspaceSlug.toUpperCase()}`;
export const API_TOKEN_DETAILS = (workspaceSlug: string, tokenId: string) =>
  `API_TOKEN_DETAILS_${workspaceSlug.toUpperCase()}_${tokenId.toUpperCase()}`;
