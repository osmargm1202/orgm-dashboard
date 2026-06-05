/// <reference types="astro/astro" />
/// <reference types="@astrojs/check" />

declare namespace App {}

interface ImportMetaEnv {}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
