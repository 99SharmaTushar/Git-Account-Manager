import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { exec } from 'child_process';

export interface GitProfile {
  label: string;
  name: string;
  email: string;
}

interface GitProfileData {
  current?: string;
  profiles: GitProfile[];
}

const profileFilePath = path.join(os.homedir(), '.vscode-git-profiles.json');

function loadProfileData(): GitProfileData {
  if (!fs.existsSync(profileFilePath)) {
    return { profiles: [] };
  }

  try {
    const raw = fs.readFileSync(profileFilePath, 'utf-8');
    const parsed = JSON.parse(raw);

    // Validate structure
    if (!parsed || !Array.isArray(parsed.profiles)) {
      return { profiles: [] };
    }

    return parsed;
  } catch {
    return { profiles: [] };
  }
}


function saveProfileData(data: GitProfileData) {
  fs.writeFileSync(profileFilePath, JSON.stringify(data, null, 2));
}

export async function getProfiles(): Promise<GitProfile[]> {
  const data = loadProfileData();
  return data.profiles;
}

export async function saveProfiles(profiles: GitProfile[]) {
  const data = loadProfileData();
  data.profiles = profiles;
  if (data.current && !profiles.some(p => p.label === data.current)) {
    data.current = undefined;
  }
  saveProfileData(data);
}

export async function setCurrentProfile(profile: GitProfile) {
  const data = loadProfileData();
  data.current = profile.label;
  saveProfileData(data);
  await setGitConfig(profile);
}

export async function getCurrentProfile(): Promise<GitProfile | undefined> {
  const data = loadProfileData();
  return data.profiles.find(p => p.label === data.current);
}

function setGitConfig(profile: GitProfile): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(
      `git config --global user.name "${profile.name}" && git config --global user.email "${profile.email}"`,
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}
