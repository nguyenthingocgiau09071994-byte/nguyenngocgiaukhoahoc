# 🎨 DESIGN SYSTEM — MASTERCLASS VN
**Version:** 2.0  
**Ngày tạo:** 08/07/2026

## 1. Color Palette

### Brand Scale (Teal)
| Token | Hex | Dùng cho |
|---|---|---|
| `--brand-950` | `#031e21` | Background tối nhất |
| `--brand-900` | `#04292e` | Sidebar deep |
| `--brand-700` | `#0d5962` | Section dark |
| `--brand-600` | `#105f68` | **PRIMARY ACTION** |
| `--brand-300` | `#63c1bb` | **ACCENT** |
| `--brand-25`  | `#f0f9f8` | Surface |

### Gold
| Token | Hex |
|---|---|
| `--gold-500` | `#e7b84f` |
| `--gold-400` | `#ffd875` |

### Semantic
| Token | Hex |
|---|---|
| `--color-text-primary`   | `#0b3d43` |
| `--color-text-secondary` | `#2c6368` |
| `--color-text-muted`     | `#647b7e` |
| `--color-danger`         | `#d9383a` |

## 2. Typography Scale
| Token | Size |
|---|---|
| `--text-2xs` | 11px (WCAG minimum) |
| `--text-xs`  | 12px |
| `--text-sm`  | 13px |
| `--text-base`| 15px |
| `--text-md`  | 17px |
| `--text-lg`  | 20px |
| `--text-xl`  | 24px |
| `--text-2xl` | 28px |
| `--text-hero`| clamp(36px,4.2vw,62px) |

## 3. Spacing (4px Grid)
4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64px

## 4. Border Radius
| Token | Value |
|---|---|
| `--radius-sm`  | 8px  |
| `--radius-md`  | 12px |
| `--radius-lg`  | 16px |
| `--radius-xl`  | 20px |
| `--radius-2xl` | 24px |
| `--radius-3xl` | 28px |

## 5. Z-Index Layers
| Token | Value |
|---|---|
| `--z-header`  | 30  |
| `--z-sidebar` | 50  |
| `--z-modal`   | 200 |
| `--z-toast`   | 300 |
| `--z-top`     | 9999|

## 6. Shadow Elevation
| Token | Usage |
|---|---|
| `--shadow-xs` | Subtle hover |
| `--shadow-sm` | Small card |
| `--shadow-md` | Standard card |
| `--shadow-lg` | Raised card |
| `--shadow-xl` | Modal, hero |

## 7. Transitions
| Token | Value |
|---|---|
| `--transition-fast` | 0.15s ease |
| `--transition-base` | 0.25s ease |
| `--transition-slow` | 0.4s cubic-bezier(.2,.8,.2,1) |

## 8. Responsive Breakpoints
- 1050px: Tablet layout
- 900px:  Sidebar collapse
- 760px:  Full mobile
- 430px:  Small mobile

## 9. Accessibility Rules
- Focus ring: 3px solid `--brand-300`
- Min font size: 11px (`--text-2xs`)
- aria-label required on: icon buttons, modal, toast, iframe, external links

## 10. Component File Location
All canonical styles in: `styles.css` (lines 6572+, DESIGN SYSTEM v2.0 block)
