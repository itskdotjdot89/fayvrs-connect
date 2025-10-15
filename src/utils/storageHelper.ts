import { supabase } from '@/integrations/supabase/client';

/**
 * Generate a signed URL for a verification document
 * @param path - The storage path of the document
 * @returns Signed URL valid for 1 hour, or null if error
 */
export async function getSignedVerificationUrl(path: string): Promise<string | null> {
  if (!path) return null;
  
  try {
    const { data, error } = await supabase.storage
      .from('verification-documents')
      .createSignedUrl(path, 3600); // 1 hour expiration
    
    if (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Failed to generate signed URL for path:', path, error);
    return null;
  }
}

/**
 * Generate signed URLs for multiple verification documents
 * @param paths - Array of storage paths
 * @returns Array of signed URLs (or null for each failed path)
 */
export async function getSignedUrls(paths: string[]): Promise<(string | null)[]> {
  return Promise.all(paths.map(path => getSignedVerificationUrl(path)));
}
