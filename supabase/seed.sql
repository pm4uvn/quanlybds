-- Optional sample data for Realty360.
--
-- Run schema.sql first. Then replace the placeholder below with your own
-- Supabase user id (Authentication → Users → copy the UUID, or run
-- `select id, email from auth.users;` in the SQL editor) and run this file.
--
-- When run from the SQL editor, auth.uid() is null (there is no logged-in
-- request), so owner_id must be set explicitly here rather than relying on
-- the column default.

do $$
declare
  v_owner uuid := '00000000-0000-0000-0000-000000000000'; -- <-- replace with your user id
  v_project uuid;
  v_property uuid;
begin
  insert into public.projects (
    owner_id, name, developer, project_type, address, province, district,
    description, construction_status, total_units, starting_price, avg_price_per_m2,
    payment_policy, bank_financing_policy, legal_verification_status,
    legal_verification_source, legal_verification_last_verified_at, is_demo
  ) values (
    v_owner, 'Sunrise Riverside', 'Nam Long Group', 'can_ho',
    'Đường Nguyễn Hữu Thọ, Quận 7', 'TP. Hồ Chí Minh', 'Quận 7',
    'Khu căn hộ ven sông với hệ thống tiện ích nội khu khép kín.',
    'handed_over', 1200, 2600000000, 42000000,
    'Thanh toán 95% nhận nhà, 5% khi ra sổ',
    'Hỗ trợ vay 70% qua Vietcombank, ân hạn gốc 12 tháng',
    'verified', 'Hồ sơ chủ đầu tư', now(), true
  )
  returning id into v_project;

  insert into public.properties (
    owner_id, project_id, name, property_type, transaction_type,
    block, floor, unit_number, usable_area, bedrooms, bathrooms, direction,
    listing_price, discount, final_price, status, legal_status,
    legal_source_status, availability_source_status, availability_source_last_verified_at,
    description, advantages, disadvantages, is_demo
  ) values (
    v_owner, v_project, 'Sunrise-A12-05', 'can_ho', 'sale',
    'A', '12', '05', 68, 2, 2, 'dong_nam',
    2800000000, 50000000, 2750000000, 'available', 'verified',
    'verified', 'verified', now(),
    'Căn hộ 2 phòng ngủ view sông, ban công Đông Nam.',
    'Vị trí đẹp, view thoáng, bàn giao đúng tiến độ.',
    'Phí quản lý ở mức trung bình - cao so với khu vực.', true
  )
  returning id into v_property;

  insert into public.product_scores (
    property_id, owner_id, score_location, score_price, score_legal,
    score_amenities, score_livability, score_investment, score_liquidity
  ) values (
    v_property, v_owner, 80, 70, 90, 75, 85, 65, 60
  );

  insert into public.swot_analyses (
    property_id, owner_id, strengths, weaknesses, opportunities, threats, approved
  ) values (
    v_property, v_owner,
    array['Vị trí thuận tiện di chuyển trung tâm', 'Thiết kế tối ưu diện tích sử dụng'],
    array['Phí quản lý cao hơn trung bình khu vực'],
    array['Hạ tầng khu vực đang được đầu tư nâng cấp', 'Nhu cầu thuê ở khu vực tăng'],
    array['Nguồn cung tương lai từ các dự án lân cận', 'Biến động lãi suất vay mua nhà'],
    false
  );

  insert into public.product_usps (
    property_id, owner_id, top_reasons, competitive_advantages, differentiation,
    ideal_customers, not_suitable_for, objections, elevator_pitch
  ) values (
    v_property, v_owner,
    array['Vị trí kết nối tốt', 'Mức giá cạnh tranh trong khu vực', 'Chủ đầu tư có uy tín triển khai'],
    array['Tiến độ bàn giao đúng hẹn', 'Pháp lý minh bạch hơn một số dự án lân cận'],
    'Sản phẩm phù hợp cho khách mua để ở lâu dài với mức giá hợp lý theo khu vực.',
    array['Gia đình trẻ mua để ở', 'Nhà đầu tư trung hạn'],
    array['Khách cần bàn giao gấp dưới 3 tháng nếu đang xây dựng'],
    '[{"objection": "Giá cao quá", "response": "So với mặt bằng khu vực, mức giá này đã bao gồm tiện ích nội khu và chính sách hỗ trợ vay ưu đãi."}]'::jsonb,
    'Sản phẩm vị trí tốt, giá cạnh tranh, phù hợp nhu cầu ở thực và đầu tư trung hạn.'
  );
end $$;
