import * as vscode from 'vscode';
import {
  getProfiles,
  saveProfiles,
  setCurrentProfile,
  getCurrentProfile,
  GitProfile
} from '../profileManager';
import { GitProfileProvider } from '../treeView';

export async function deleteGitProfile(
  provider: GitProfileProvider,
  profileFromClick?: GitProfile,
  onSwitchedProfile?: () => void
) {
  const profiles = await getProfiles();
  let selectedLabel: string | undefined;

  if (profileFromClick) {
    selectedLabel = profileFromClick.label;
  } else {
    const labels = profiles.map(p => p.label);
    selectedLabel = await vscode.window.showQuickPick(labels, {
      placeHolder: 'Select profile to delete'
    });
  }

  if (!selectedLabel) return;

  const updated = profiles.filter(p => p.label !== selectedLabel);
  await saveProfiles(updated);

  const current = await getCurrentProfile();
  const wasCurrent = current?.label === selectedLabel;

  if (wasCurrent && updated.length > 0) {
    await setCurrentProfile(updated[0]);
    vscode.window.showInformationMessage(`Deleted ${selectedLabel}. Switched to ${updated[0].label}.`);
    if (onSwitchedProfile) {
      onSwitchedProfile();
    }
  } else if (wasCurrent) {
    vscode.window.showWarningMessage(`Deleted ${selectedLabel}. No profiles remaining.`);
  } else {
    vscode.window.showInformationMessage(`Deleted profile: ${selectedLabel}`);
  }

  provider.refresh();
}
