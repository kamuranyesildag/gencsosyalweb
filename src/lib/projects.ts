import { fetchApi } from "./api";

export interface Project {
  id: number;
  userId: number;
  title: string;
  description: string;
  detailedDescription: string | null;
  category: string;
  status: string;
  projectUrl: string | null;
  githubUrl: string | null;
  imageUrl: string | null;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  username?: string | null;
}

export async function getUserProjects(userId: number): Promise<Project[]> {
  const response = await fetchApi(`/projects/user/${userId}`);
  if (!response.ok) {
    throw new Error("Projeler yüklenemedi.");
  }
  const result = await response.json();
  return result.data.projects;
}

export async function getProject(id: number): Promise<Project> {
  const response = await fetchApi(`/projects/${id}`);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Proje yüklenemedi.");
  }
  const result = await response.json();
  return result.data.project;
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  const response = await fetchApi("/projects", {
    method: "POST",
    data,
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || "Proje oluşturulamadı.");
  }
  return result.data.project;
}

export async function updateProject(id: number, data: Partial<Project>): Promise<Project> {
  const response = await fetchApi(`/projects/${id}`, {
    method: "PATCH",
    data,
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || "Proje güncellenemedi.");
  }
  return result.data.project;
}

export async function deleteProject(id: number): Promise<void> {
  const response = await fetchApi(`/projects/${id}`, {
    method: "DELETE",
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || "Proje silinemedi.");
  }
}


export interface ProjectsResponse {
  projects: Project[];
  total: number;
  hasMore: boolean;
  page: number;
}

export async function getAllProjects(params?: {
  q?: string;
  category?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<ProjectsResponse> {
  const query = new URLSearchParams();
  if (params?.q) query.append('q', params.q);
  if (params?.category) query.append('category', params.category);
  if (params?.status) query.append('status', params.status);
  if (params?.sort) query.append('sort', params.sort);
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  
  const queryString = query.toString() ? `?${query.toString()}` : '';
  const response = await fetchApi(`/projects${queryString}`);
  
  if (!response.ok) {
    throw new Error("Projeler yüklenemedi.");
  }
  const result = await response.json();
  return {
    projects: result.data.projects || [],
    total: result.data.total ?? result.data.projects?.length ?? 0,
    hasMore: Boolean(result.data.hasMore),
    page: result.data.page ?? 1,
  };
}


export interface ProjectComment {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
  username: string;
  avatarUrl: string | null;
  fullName: string | null;
}

export async function getProjectLikes(id: number): Promise<{ totalLikes: number; likes: { userId: number }[] }> {
  const response = await fetchApi(`/projects/${id}/like`);
  if (!response.ok) {
    throw new Error("Beğeniler yüklenemedi.");
  }
  const result = await response.json();
  return result.data;
}

export async function likeProject(id: number): Promise<void> {
  const response = await fetchApi(`/projects/${id}/like`, { method: "POST" });
  if (!response.ok) {
    throw new Error("Proje beğenilemedi.");
  }
}

export async function unlikeProject(id: number): Promise<void> {
  const response = await fetchApi(`/projects/${id}/like`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error("Beğeni geri alınamadı.");
  }
}

export async function getProjectComments(id: number): Promise<ProjectComment[]> {
  const response = await fetchApi(`/projects/${id}/comments`);
  if (!response.ok) {
    throw new Error("Yorumlar yüklenemedi.");
  }
  const result = await response.json();
  return result.data.comments;
}

export async function addProjectComment(id: number, content: string): Promise<{comment: ProjectComment, pending?: boolean}> {
  const response = await fetchApi(`/projects/${id}/comments`, {
    method: "POST",
    data: { content },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Yorum eklenemedi.");
  }
  const result = await response.json();
  return { comment: result.data.comment, pending: result.data.pending };
}

export async function deleteProjectComment(projectId: number, commentId: number): Promise<void> {
  const response = await fetchApi(`/projects/${projectId}/comments/${commentId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Yorum silinemedi.");
  }
}
