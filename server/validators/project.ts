import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Proje başlığı gereklidir.").max(100, "Başlık en fazla 100 karakter olabilir."),
  description: z.string().min(1, "Proje açıklaması gereklidir.").max(2000, "Açıklama çok uzun."),
  detailedDescription: z.string().max(10000, "Detaylı açıklama çok uzun.").optional().or(z.literal("")),
  category: z.string().min(1, "Kategori gereklidir.").max(50, "Kategori çok uzun."),
  status: z.string().min(1, "Durum gereklidir.").max(50, "Durum çok uzun."),
  projectUrl: z.string().url("Geçerli bir URL giriniz.").max(255).optional().or(z.literal("")),
  githubUrl: z.string().url("Geçerli bir URL giriniz.").max(255).optional().or(z.literal("")),
  imageUrl: z.string().url("Geçerli bir URL giriniz.").max(1000).optional().or(z.literal("")),
  tags: z.array(z.string().min(1, "Etiket boş olamaz.").max(30, "Etiket çok uzun.")).max(10, "En fazla 10 etiket ekleyebilirsiniz.").optional(),
});
