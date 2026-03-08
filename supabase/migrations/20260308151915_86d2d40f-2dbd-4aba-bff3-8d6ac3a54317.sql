DROP POLICY IF EXISTS "Finance can resubmit their rejected requests" ON public.maintenance_logs;

CREATE POLICY "Finance can resubmit their rejected requests"
ON public.maintenance_logs
FOR UPDATE
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['finance'::app_role])
  AND approval_status = 'rejected'
  AND (submitted_by = auth.uid() OR submitted_by IS NULL)
)
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['finance'::app_role])
  AND approval_status = 'pending'
  AND submitted_by = auth.uid()
  AND reviewed_by IS NULL
  AND reviewed_at IS NULL
  AND rejection_reason IS NULL
);