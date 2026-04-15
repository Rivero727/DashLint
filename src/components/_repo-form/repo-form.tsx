"use client";

import { useState } from 'react';
import styles from '@/components/ui/repo-form.module.css';
import { DocumentDuplicateIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';

export default function RepoForm() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convertimos la FileList en un Array para manejarlo mejor
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Archivos a subir:", files);
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Nuevo Repositorio</h2>
        <p className={styles.formSubtitle}>Llene los campos requeridos y suba la documentación.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Vendedor</label>
            <input type="text" placeholder="Ej: Microsoft" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label>Nombre del Repositorio</label>
            <input type="text" placeholder="Ej: coresa-infra-v1" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label>Cliente</label>
            <input type="text" placeholder="Nombre del cliente" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label>Empresa</label>
            <input type="text" placeholder="Empresa asociada" className={styles.input} />
          </div>
        </div>

        <div className={styles.fieldFull}>
          <label>Descripción del Repositorio</label>
          <textarea placeholder="Detalles adicionales..." className={styles.textarea} rows={4} />
        </div>

        {/* Dropzone */}
        <div className={styles.fieldFull}>
          <label>Documentación (PDFs)</label>
          <div className={styles.dropzone}>
            <DocumentDuplicateIcon className={styles.uploadIcon} />
            <p>Arrastra tus archivos PDF aquí o <span>haz clic para subir</span></p>
            <input 
              type="file" 
              multiple 
              accept=".pdf" 
              className={styles.fileInput} 
              onChange={handleFileChange}
            />
          </div>

          {/* LISTA DE ARCHIVOS SELECCIONADOS */}
          {files.length > 0 && (
            <div className={styles.fileList}>
              {files.map((file, index) => (
                <div key={index} className={styles.fileItem}>
                  <div className={styles.fileInfo}>
                    <DocumentIcon className={styles.fileIcon} />
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeFile(index)}
                    className={styles.removeBtn}
                  >
                    <XMarkIcon className={styles.closeIcon} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn}>
            Crear Repositorio
          </button>
        </div>
      </form>
    </div>
  );
}