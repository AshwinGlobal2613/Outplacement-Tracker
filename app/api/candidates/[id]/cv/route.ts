import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCandidateById, updateCandidate } from "@/lib/db";
import { CVProfile, CVNamedProfile } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

function uid() { return `cv_${uuidv4().slice(0, 8)}`; }

// Migrate old single cvProfile into cvProfiles array if needed
function getProfiles(candidate: Awaited<ReturnType<typeof getCandidateById>>): CVNamedProfile[] {
  if (!candidate) return [];
  const existing = candidate.cvProfiles ?? [];
  if (existing.length > 0) return existing;
  // Migrate old single profile
  if (candidate.cvProfile) {
    return [{
      id: uid(),
      name: "Resume 1",
      createdAt: candidate.cvProfile.updatedAt ?? new Date().toISOString(),
      updatedAt: candidate.cvProfile.updatedAt,
      profile: candidate.cvProfile,
    }];
  }
  return [];
}

// GET — list all CV profiles
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(getProfiles(candidate));
}

// POST — create a new CV profile
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isStaff = session.user.role === "admin" || session.user.role === "team_member";
  const isOwner = session.user.role === "candidate" && session.user.candidateId === params.id;
  if (!isStaff && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const profiles = getProfiles(candidate);

  const newProfile: CVNamedProfile = {
    id: uid(),
    name: body.name ?? `Resume ${profiles.length + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      headline: "", summary: "", linkedinAbout: "",
      skills: [], languages: [], certifications: [],
      experience: [], education: [],
      interests: [], projects: [], courses: [], awards: [],
      publications: [], references: [], declaration: "", customSections: [],
      sectionOrder: [], style: { accentColor: "#e11d48", fontFamily: "Inter, system-ui, sans-serif", fontSize: "md", spacing: "normal" },
      contact: {},
    },
  };

  const updated = await updateCandidate(params.id, { cvProfiles: [...profiles, newProfile] });
  if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json(newProfile);
}

// PUT — update a specific CV profile (cvId in body)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isStaff = session.user.role === "admin" || session.user.role === "team_member";
  const isOwner = session.user.role === "candidate" && session.user.candidateId === params.id;
  if (!isStaff && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { cvId, name, ...profileFields } = body;

  const profiles = getProfiles(candidate);
  const now = new Date().toISOString();

  let updatedProfiles: CVNamedProfile[];

  if (cvId) {
    const exists = profiles.some((p) => p.id === cvId);

    if (!exists) {
      // First save — create the profile entry
      const newEntry: CVNamedProfile = {
        id: cvId,
        name: name ?? `Resume ${profiles.length + 1}`,
        createdAt: now,
        updatedAt: now,
        profile: {
          headline: profileFields.headline ?? "",
          summary: profileFields.summary ?? "",
          linkedinAbout: profileFields.linkedinAbout ?? "",
          skills: profileFields.skills ?? [],
          languages: profileFields.languages ?? [],
          certifications: profileFields.certifications ?? [],
          experience: profileFields.experience ?? [],
          education: profileFields.education ?? [],
          interests: profileFields.interests ?? [],
          projects: profileFields.projects ?? [],
          courses: profileFields.courses ?? [],
          awards: profileFields.awards ?? [],
          organisations: profileFields.organisations ?? [],
          publications: profileFields.publications ?? [],
          references: profileFields.references ?? [],
          declaration: profileFields.declaration ?? "",
          customSections: profileFields.customSections ?? [],
          sectionOrder: profileFields.sectionOrder,
          style: profileFields.style,
          contact: profileFields.contact ?? {},
          updatedAt: now,
        } as CVProfile,
      };
      updatedProfiles = [...profiles, newEntry];
    } else {
    // Update existing
    updatedProfiles = profiles.map((p) => p.id === cvId
      ? {
          ...p,
          name: name ?? p.name,
          updatedAt: now,
          profile: {
            headline:       profileFields.headline       ?? p.profile.headline       ?? "",
            summary:        profileFields.summary        ?? p.profile.summary        ?? "",
            linkedinAbout:  profileFields.linkedinAbout  ?? p.profile.linkedinAbout  ?? "",
            skills:         profileFields.skills         ?? p.profile.skills         ?? [],
            languages:      profileFields.languages      ?? p.profile.languages      ?? [],
            certifications: profileFields.certifications ?? p.profile.certifications ?? [],
            experience:     profileFields.experience     ?? p.profile.experience     ?? [],
            education:      profileFields.education      ?? p.profile.education      ?? [],
            interests:      profileFields.interests      ?? p.profile.interests      ?? [],
            projects:       profileFields.projects       ?? p.profile.projects       ?? [],
            courses:        profileFields.courses        ?? p.profile.courses        ?? [],
            awards:         profileFields.awards         ?? p.profile.awards         ?? [],
            organisations:  profileFields.organisations  ?? p.profile.organisations  ?? [],
            publications:   profileFields.publications   ?? p.profile.publications   ?? [],
            references:     profileFields.references     ?? p.profile.references     ?? [],
            declaration:    profileFields.declaration    ?? p.profile.declaration    ?? "",
            customSections: profileFields.customSections ?? p.profile.customSections ?? [],
            sectionOrder:   profileFields.sectionOrder   ?? p.profile.sectionOrder,
            style:          profileFields.style          ?? p.profile.style,
            contact:        profileFields.contact        ?? p.profile.contact        ?? {},
            updatedAt:      now,
          } as CVProfile,
        }
      : p
    );
    } // end else (update existing)
  } else {
    return NextResponse.json({ error: "cvId required" }, { status: 400 });
  }

  const updated = await updateCandidate(params.id, { cvProfiles: updatedProfiles });
  if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  return NextResponse.json(updatedProfiles.find((p) => p.id === cvId) ?? null);
}

// DELETE — remove a CV profile
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isStaff = session.user.role === "admin" || session.user.role === "team_member";
  const isOwner = session.user.role === "candidate" && session.user.candidateId === params.id;
  if (!isStaff && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { cvId } = await req.json();
  const profiles = getProfiles(candidate);
  const filtered = profiles.filter((p) => p.id !== cvId);

  // Allow deleting all CVs — leaves an empty list

  const updated = await updateCandidate(params.id, { cvProfiles: filtered });
  if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
