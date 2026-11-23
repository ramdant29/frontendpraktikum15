import { db } from "@/lib/prisma";
import type { Item } from "@prisma/client";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const editId = edit ? Number(edit) : null;

  const items = await db.item.findMany({
    orderBy: { createdAt: "desc" },
  });

  // CREATE
  async function addItem(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    if (!name?.trim()) return;
    await db.item.create({ data: { name: name.trim() } });
    revalidatePath("/");
  }

  // UPDATE
  async function updateItem(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    const name = formData.get("name") as string;
    if (!name?.trim()) return;
    await db.item.update({
      where: { id },
      data: { name: name.trim() },
    });
    revalidatePath("/");
  }

  // DELETE
  async function deleteItem(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    await db.item.delete({ where: { id } });
    revalidatePath("/");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#121212",
        color: "#f5f5f5",
        padding: "3rem 1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          backgroundColor: "#1C1C1E",
          padding: "2rem",
          borderRadius: "12px",
          border: "1px solid #2c2c2e",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.5rem" }}>
          Daftar Item
        </h1>

        {/* FORM CREATE */}
        <form
          action={addItem}
          style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}
        >
          <input
            type="text"
            name="name"
            placeholder="Tambah item baru..."
            required
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #3a3a3c",
              backgroundColor: "#121212",
              color: "#fff",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tambah
          </button>
        </form>

        {/* LIST READ, UPDATE, DELETE */}
        {items.length === 0 ? (
          <p style={{ color: "#8e8e93", textAlign: "center" }}>
            Belum ada data. Silakan tambahkan item baru.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map((item: Item) => (
              <li
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  padding: "12px",
                  marginBottom: "8px",
                  backgroundColor: "#121212",
                  borderRadius: "8px",
                  border: "1px solid #2c2c2e",
                }}
              >
                {editId === item.id ? (
                  /* MODE UPDATE */
                  <form
                    action={updateItem}
                    style={{ display: "flex", flex: 1, gap: "8px" }}
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      type="text"
                      name="name"
                      defaultValue={item.name}
                      required
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid #3a3a3c",
                        backgroundColor: "#1C1C1E",
                        color: "#fff",
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "#16a34a",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Simpan
                    </button>
                    <Link
                      href="/"
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        backgroundColor: "#3a3a3c",
                        color: "#fff",
                        textDecoration: "none",
                        fontSize: "0.875rem",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      Batal
                    </Link>
                  </form>
                ) : (
                  /* MODE READ / VIEW */
                  <>
                    <span>{item.name}</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Link
                        href={`/?edit=${item.id}`}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          backgroundColor: "#d97706",
                          color: "#fff",
                          textDecoration: "none",
                          fontSize: "0.875rem",
                        }}
                      >
                        Edit
                      </Link>
                      <form action={deleteItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#dc2626",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                          }}
                        >
                          Hapus
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}