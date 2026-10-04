"use client";

import Link from "next/link";
import { Box, Button, Container, Stack } from "@mui/material";
import { usePathname } from "next/navigation";

const links = [
  {
    label: "Startsida",
    href: "/",
  },
  {
    label: "Spelare",
    href: "/players",
  },
  {
    label: "Skapa cup",
    href: "/tournaments/new",
  },
];

export default function AppHeader() {
  const pathname = usePathname();

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
          <Box
            component={Link}
            href="/"
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

          <Stack
            component="nav"
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1 },
              overflowX: "auto",
            }}
          >
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  size="small"
                  variant="text"
                  sx={{
                    position: "relative",
                    minWidth: 0,
                    minHeight: { xs: 38, sm: 42 },
                    px: { xs: 1.25, sm: 2 },
                    fontSize: { xs: "0.82rem", sm: "0.95rem" },
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
                          left: { xs: 10, sm: 16 },
                          right: { xs: 10, sm: 16 },
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
        </Stack>
      </Container>
    </Box>
  );
}
