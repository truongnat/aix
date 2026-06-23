import * as clack from '@clack/prompts';
import { HARNESS_PROVIDERS } from '../constants';

export async function selectProviders() {
    clack.intro('🚀 Select provider AI install');

    const features = await clack.multiselect({
        message: 'AI Harness support Claude and CodeX:',
        options: Object.values(HARNESS_PROVIDERS),
        required: true,
    });

    // Kiểm tra nếu người dùng hủy bỏ (nhấn Ctrl+C)
    if (clack.isCancel(features)) {
        clack.cancel('Installation canceled by user.');
        process.exit(0);
    }

    clack.outro('Start installing selected providers...');
    return features as string[];
}