"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";

const links = [
  {
    label: "Startsida",
    href: "/",
    number: "01",
  },
  {
    label: "Spelare",
    href: "/players",
    number: "02",
  },
  {
    label: "Tidigare cuper",
    href: "/tournaments/history",
    number: "03",
  },
  {
    label: "Skapa cup",
    href: "/tournaments/new",
    number: "04",
  },
];

function MenuIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={{ fontSize: 26 }}>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M4 7h16M4 12h16M4 17h16" />
      </g>
    </SvgIcon>
  );
}

function CloseIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={{ fontSize: 24 }}>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M5 5l14 14M19 5 5 19" />
      </g>
    </SvgIcon>
  );
}

function ArrowIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={{ fontSize: 20 }}>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 18 18 6M8 6h10v10" />
      </g>
    </SvgIcon>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Stäng menyn om användaren navigerar till en annan sida.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  return (
    <Box
      component="header"
      sx={{
        borderBottom: "1px solid rgba(255,255,255,0.10)",
        backgroundColor: "rgba(10,10,10,0.96)",
      }}
    >
      <Container maxWidth="xl">
        <Stack
          sx={{
            minHeight: { xs: 78, sm: 94 },
            py: { xs: 1, sm: 1.25 },
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: { xs: 1.5, sm: 3 },
          }}
        >
          {/* LOGOTYP */}
          <Box
            component={Link}
            href="/"
            onClick={() => setMenuOpen(false)}
            sx={{
              display: "block",
              flexShrink: 0,
              lineHeight: 0,
              textDecoration: "none",
            }}
          >
            <Box
              component="img"
              src="/pasdart-logo.png"
              alt="Pas d'Art Sollentuna"
              sx={{
                display: "block",
                width: { xs: 168, sm: 225 },
                height: "auto",
                maxHeight: { xs: 60, sm: 74 },
                objectFit: "contain",
              }}
            />
          </Box>

          {/* DESKTOP-NAVIGATION */}
          <Stack
            component="nav"
            aria-label="Huvudnavigation"
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
            }}
          >
            {links.map((link) => {
              const active = isActivePath(pathname, link.href);

              return (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  size="small"
                  variant="text"
                  aria-current={active ? "page" : undefined}
                  sx={{
                    position: "relative",
                    minWidth: 0,
                    minHeight: 42,
                    px: 2,
                    fontSize: "0.95rem",
                    borderRadius: 0.75,
                    color: active ? "text.primary" : "text.secondary",
                    fontWeight: active ? 800 : 700,
                    whiteSpace: "nowrap",

                    "&:hover": {
                      color: "text.primary",
                      backgroundColor: "rgba(255,255,255,0.04)",
                    },

                    "&::after": active
                      ? {
                          content: '""',
                          position: "absolute",
                          left: 16,
                          right: 16,
                          bottom: 1,
                          height: 2,
                          backgroundColor: "error.dark",
                        }
                      : undefined,
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Stack>

          {/* MOBILENS MENYKNAPP */}
          <IconButton
            aria-label="Öppna meny"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? "pasdart-mobile-menu" : undefined}
            onClick={() => setMenuOpen(true)}
            sx={{
              display: { xs: "flex", md: "none" },
              width: 44,
              height: 44,
              flexShrink: 0,
              color: "text.primary",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 0.75,
              "&:hover": {
                borderColor: "rgba(198,40,40,0.5)",
                backgroundColor: "rgba(198,40,40,0.05)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Stack>
      </Container>

      {/* MOBILMENY */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            id: "pasdart-mobile-menu",
            sx: {
              width: { xs: "min(340px, 100vw)", sm: 380 },
              maxWidth: "100vw",
              backgroundColor: "#121212",
              backgroundImage: "none",
              borderLeft: "1px solid rgba(255,255,255,0.12)",
              color: "text.primary",
            },
          },
        }}
      >
        {/* TRE FÄRGSTRECK */}
        <Box
          sx={{
            height: 3,
            display: "flex",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          {["success.dark", "error.dark", "success.dark"].map(
            (color, index) => (
              <Box
                key={index}
                sx={{
                  width: 28,
                  height: 3,
                  backgroundColor: color,
                }}
              />
            ),
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            p: { xs: 3, sm: 3.5 },
          }}
        >
          {/* MENYHEADER */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
              pb: 3,
              borderBottom: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontStyle: "italic",
                  fontSize: "1.45rem",
                  color: "text.primary",
                }}
              >
                Pas d&apos;Art
              </Typography>

              <Typography
                sx={{
                  mt: 0.6,
                  fontSize: "0.7rem",
                  color: "error.light",
                  fontWeight: 900,
                  letterSpacing: "0.11em",
                }}
              >
                NAVIGATION
              </Typography>
            </Box>

            <IconButton
              onClick={() => setMenuOpen(false)}
              aria-label="Stäng meny"
              sx={{
                width: 40,
                height: 40,
                color: "text.secondary",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 0.75,
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* MENYLÄNKAR */}
          <Box component="nav" aria-label="Mobilnavigation" sx={{ mt: 2 }}>
            {links
              .filter((link) => link.href !== "/tournaments/new")
              .map((link) => {
                const active = isActivePath(pathname, link.href);

                return (
                  <Box
                    key={link.href}
                    component={Link}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      minHeight: 67,
                      px: 1.5,
                      textDecoration: "none",
                      color: active ? "text.primary" : "text.secondary",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      borderLeft: "2px solid",
                      borderLeftColor: active ? "error.main" : "transparent",
                      backgroundColor: active
                        ? "rgba(198,40,40,0.055)"
                        : "transparent",
                      transition: "background-color 0.2s",

                      "&:hover": {
                        color: "text.primary",
                        backgroundColor: "rgba(255,255,255,0.035)",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        color: active ? "error.light" : "text.disabled",
                        minWidth: 25,
                      }}
                    >
                      {link.number}
                    </Typography>

                    <Typography
                      sx={{
                        flex: 1,
                        fontSize: "1.05rem",
                        fontWeight: active ? 900 : 700,
                      }}
                    >
                      {link.label}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        color: active ? "error.light" : "text.secondary",
                      }}
                    >
                      <ArrowIcon />
                    </Box>
                  </Box>
                );
              })}
          </Box>

          {/* SKAPA CUP CTA */}
          <Button
            component={Link}
            href="/tournaments/new"
            onClick={() => setMenuOpen(false)}
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              minHeight: 50,
              borderRadius: 0.75,
              fontWeight: 900,
              textTransform: "none",
              fontSize: "0.95rem",
              boxShadow: "none",
            }}
          >
            Skapa ny cup
          </Button>

          <Box sx={{ flex: 1, minHeight: 24 }} />

          {/* SIDFOT */}
          <Box
            sx={{
              pt: 2,
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                color: "text.disabled",
                letterSpacing: "0.12em",
                fontWeight: 800,
              }}
            >
              PAS D&apos;ART
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
