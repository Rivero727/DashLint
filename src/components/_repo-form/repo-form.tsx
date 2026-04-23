"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "@/components/ui/repo-form.module.css";
import {
  DocumentDuplicateIcon,
  XMarkIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

type ExistingRepoFile = {
  fileId: number;
  fileName: string;
  filePath: string;
  fileSize: number | null;
};

type RepoFormProps = {
  sellerName: string;
  sellerEmail: string;
  mode?: "create" | "edit";
  submitId?: number;
  initialData?: {
    submitName: string;
    clientName: string;
    companyName: string;
    description: string;
    existingFiles: ExistingRepoFile[];
  };
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

function useLookupSuggestions(type: "client" | "company", value: string) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const query = value.trim();

    if (query.length < 1) {
      setItems([]);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/lookups?type=${type}&q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          setItems([]);
          return;
        }

        const data = (await response.json()) as { items?: string[] };
        setItems(data.items ?? []);
      } catch {
        setItems([]);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [type, value]);

  return items;
}

export default function RepoForm({
  sellerName,
  sellerEmail,
  mode = "create",
  submitId,
  initialData,
}: RepoFormProps) {
  const [submitName, setSubmitName] = useState(initialData?.submitName ?? "");
  const [clientName, setClientName] = useState(initialData?.clientName ?? "");
  const [companyName, setCompanyName] = useState(
    initialData?.companyName ?? "",
  );
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [existingFiles, setExistingFiles] = useState<ExistingRepoFile[]>(
    initialData?.existingFiles ?? [],
  );
  const [removedFileIds, setRemovedFileIds] = useState<number[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const clientSuggestions = useLookupSuggestions("client", clientName);
  const companySuggestions = useLookupSuggestions("company", companyName);

  useEffect(() => {
    setSubmitName(initialData?.submitName ?? "");
    setClientName(initialData?.clientName ?? "");
    setCompanyName(initialData?.companyName ?? "");
    setDescription(initialData?.description ?? "");
    setExistingFiles(initialData?.existingFiles ?? []);
    setRemovedFileIds([]);
    setFiles([]);
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);

    setFiles((prev) => {
      const existingKeys = new Set(
        prev.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
      );

      const uniqueNewFiles = newFiles.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        return !existingKeys.has(key);
      });

      return [...prev, ...uniqueNewFiles];
    });

    e.target.value = "";
  };

  const removeNewFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (fileId: number) => {
    setRemovedFileIds((prev) =>
      prev.includes(fileId) ? prev : [...prev, fileId],
    );
    setExistingFiles((prev) => prev.filter((file) => file.fileId !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setFeedback(null);
    setIsSubmitting(true);

    if (mode === "create" && files.length === 0) {
      setFeedback({
        type: "error",
        message: "Debes subir al menos un archivo PDF.",
      });
      setIsSubmitting(false);
      return;
    }

    if (mode === "edit" && existingFiles.length === 0 && files.length === 0) {
      setFeedback({
        type: "error",
        message: "El repositorio debe conservar al menos un archivo PDF.",
      });
      setIsSubmitting(false);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.set("submitName", submitName.trim());
    formData.set("clientName", clientName.trim());
    formData.set("companyName", companyName.trim());
    formData.set("description", description.trim());

    files.forEach((file) => {
      formData.append("files", file);
    });

    removedFileIds.forEach((fileId) => {
      formData.append("removedFileIds", String(fileId));
    });

    const url =
      mode === "edit" && submitId
        ? `/api/submissions/${submitId}`
        : "/api/submissions";

    const method = mode === "edit" ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = (await response.json()) as {
        message?: string;
        submitId?: number;
        files?: ExistingRepoFile[];
      };

      if (!response.ok) {
        setFeedback({
          type: "error",
          message:
            data.message ||
            (mode === "edit"
              ? "No fue posible actualizar el repositorio."
              : "No fue posible crear el repositorio."),
        });
        setIsSubmitting(false);
        return;
      }

      setFeedback({
        type: "success",
        message:
          data.message ||
          (mode === "edit"
            ? "Repositorio actualizado correctamente."
            : "Repositorio creado correctamente."),
      });

      if (mode === "create") {
        form.reset();
        setSubmitName("");
        setClientName("");
        setCompanyName("");
        setDescription("");
        setFiles([]);
        setExistingFiles([]);
        setRemovedFileIds([]);
      } else {
        setFiles([]);
        setRemovedFileIds([]);
        if (Array.isArray(data.files)) {
          setExistingFiles(data.files);
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error enviando formulario:", error);

      setFeedback({
        type: "error",
        message:
          mode === "edit"
            ? "Ocurrió un problema de conexión al intentar actualizar el repositorio."
            : "Ocurrió un problema de conexión al intentar crear el repositorio.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>
          {mode === "edit" ? "Editar Repositorio" : "Nuevo Repositorio"}
        </h2>
        <p className={styles.formSubtitle}>
          {mode === "edit"
            ? "Modifica los datos del repositorio y su documentación."
            : "Llene los campos requeridos y suba la documentación."}
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Vendedor</label>
            <input
              type="text"
              value={`${sellerName} (${sellerEmail})`}
              className={styles.input}
              disabled
              readOnly
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="submitName">Nombre del Repositorio</label>
            <input
              id="submitName"
              name="submitName"
              type="text"
              placeholder="Ej: coresa-infra-v1"
              className={styles.input}
              value={submitName}
              onChange={(e) => setSubmitName(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="clientName">Cliente</label>
            <input
              id="clientName"
              name="clientName"
              type="text"
              list="client-suggestions"
              placeholder="Nombre del cliente"
              className={styles.input}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
            <datalist id="client-suggestions">
              {clientSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div className={styles.field}>
            <label htmlFor="companyName">Empresa</label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              list="company-suggestions"
              placeholder="Empresa asociada"
              className={styles.input}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <datalist id="company-suggestions">
              {companySuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>
        </div>

        <div className={styles.fieldFull}>
          <label htmlFor="description">Descripción del Repositorio</label>
          <textarea
            id="description"
            name="description"
            placeholder="Detalles adicionales..."
            className={styles.textarea}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {mode === "edit" && existingFiles.length > 0 && (
          <div className={styles.fieldFull}>
            <label>Documentación actual</label>
            <div className={styles.fileList}>
              {existingFiles.map((file) => (
                <div key={file.fileId} className={styles.fileItem}>
                  <div className={styles.fileInfo}>
                    <DocumentIcon className={styles.fileIcon} />
                    <Link
                      href={file.filePath}
                      target="_blank"
                      className={styles.fileLink}
                    >
                      {file.fileName}
                    </Link>
                    <span className={styles.fileSize}>
                      {file.fileSize
                        ? `(${(file.fileSize / 1024 / 1024).toFixed(2)} MB)`
                        : ""}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeExistingFile(file.fileId)}
                    className={styles.removeBtn}
                  >
                    <XMarkIcon className={styles.closeIcon} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.fieldFull}>
          <label>
            {mode === "edit"
              ? "Agregar más documentación (PDFs)"
              : "Documentación (PDFs)"}
          </label>
          <div className={styles.dropzone}>
            <DocumentDuplicateIcon className={styles.uploadIcon} />
            <p>
              Arrastra tus archivos PDF aquí o <span>haz clic para subir</span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,application/pdf"
              className={styles.fileInput}
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 && (
            <div className={styles.fileList}>
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${file.lastModified}-${index}`}
                  className={styles.fileItem}
                >
                  <div className={styles.fileInfo}>
                    <DocumentIcon className={styles.fileIcon} />
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeNewFile(index)}
                    className={styles.removeBtn}
                  >
                    <XMarkIcon className={styles.closeIcon} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {feedback && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: feedback.type === "success" ? "#166534" : "#991b1b",
              backgroundColor:
                feedback.type === "success" ? "#dcfce7" : "#fee2e2",
              border:
                feedback.type === "success"
                  ? "1px solid #86efac"
                  : "1px solid #fca5a5",
            }}
          >
            {feedback.message}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? mode === "edit"
                ? "Guardando cambios..."
                : "Creando repositorio..."
              : mode === "edit"
                ? "Guardar Cambios"
                : "Crear Repositorio"}
          </button>
        </div>
      </form>
    </div>
  );
}