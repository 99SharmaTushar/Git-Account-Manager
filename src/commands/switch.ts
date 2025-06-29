import * as vscode from 'vscode';
import { setCurrentProfile, GitProfile } from '../profileManager';
import { GitProfileProvider } from '../treeView';

export async function switchGitProfile(profile: GitProfile, provider: GitProfileProvider) {
  await setCurrentProfile(profile);
  vscode.window.showInformationMessage(`Switched to profile: ${profile.label}`);
  provider.refresh();
}
