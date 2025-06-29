import * as vscode from 'vscode';
import { getProfiles, saveProfiles, setCurrentProfile } from '../profileManager';
import { GitProfileProvider } from '../treeView';

export async function addGitProfile(provider: GitProfileProvider) {
  const label = await vscode.window.showInputBox({ prompt: 'Profile label (e.g., Work)' });
  const name = await vscode.window.showInputBox({ prompt: 'Git user.name' });
  const email = await vscode.window.showInputBox({ prompt: 'Git user.email' });

  if (!label || !name || !email) return;

  const profiles = await getProfiles();
  profiles.push({ label, name, email });
  await saveProfiles(profiles);

  vscode.window.showInformationMessage(`Added profile: ${label}`);

  await setCurrentProfile({ label, name, email });

  provider.refresh();
}
