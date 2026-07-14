-- Seed villes par pays (table GPOTB40, pays table GPOTB26)
-- Insertion des villes pour chaque pays actif

DO $$
DECLARE
  v_ci  UUID;
  v_ml  UUID;
  v_bf  UUID;
  v_mg  UUID;
  v_sn  UUID;
  v_ng  UUID;
  v_gh  UUID;
  v_ke  UUID;
  v_ug  UUID;
BEGIN

  SELECT id INTO v_ci FROM "GPOTB26" WHERE code = 'CI';
  SELECT id INTO v_ml FROM "GPOTB26" WHERE code = 'ML';
  SELECT id INTO v_bf FROM "GPOTB26" WHERE code = 'BF';
  SELECT id INTO v_mg FROM "GPOTB26" WHERE code = 'MG';
  SELECT id INTO v_sn FROM "GPOTB26" WHERE code = 'SN';
  SELECT id INTO v_ng FROM "GPOTB26" WHERE code = 'NG';
  SELECT id INTO v_gh FROM "GPOTB26" WHERE code = 'GH';
  SELECT id INTO v_ke FROM "GPOTB26" WHERE code = 'KE';
  SELECT id INTO v_ug FROM "GPOTB26" WHERE code = 'UG';

  -- Côte d'Ivoire
  IF v_ci IS NOT NULL THEN
    INSERT INTO "GPOTB40" (id, nom, "paysId") VALUES
      (gen_random_uuid(), 'Abidjan', v_ci),
      (gen_random_uuid(), 'Yamoussoukro', v_ci),
      (gen_random_uuid(), 'Bouaké', v_ci),
      (gen_random_uuid(), 'Daloa', v_ci),
      (gen_random_uuid(), 'San-Pédro', v_ci),
      (gen_random_uuid(), 'Korhogo', v_ci),
      (gen_random_uuid(), 'Man', v_ci),
      (gen_random_uuid(), 'Gagnoa', v_ci),
      (gen_random_uuid(), 'Divo', v_ci),
      (gen_random_uuid(), 'Abengourou', v_ci),
      (gen_random_uuid(), 'Soubré', v_ci),
      (gen_random_uuid(), 'Agboville', v_ci),
      (gen_random_uuid(), 'Bondoukou', v_ci),
      (gen_random_uuid(), 'Odienné', v_ci),
      (gen_random_uuid(), 'Séguéla', v_ci)
    ON CONFLICT (nom, "paysId") DO NOTHING;
  END IF;

  -- Mali
  IF v_ml IS NOT NULL THEN
    INSERT INTO "GPOTB40" (id, nom, "paysId") VALUES
      (gen_random_uuid(), 'Bamako', v_ml),
      (gen_random_uuid(), 'Sikasso', v_ml),
      (gen_random_uuid(), 'Mopti', v_ml),
      (gen_random_uuid(), 'Kayes', v_ml),
      (gen_random_uuid(), 'Gao', v_ml),
      (gen_random_uuid(), 'Ségou', v_ml),
      (gen_random_uuid(), 'Tombouctou', v_ml),
      (gen_random_uuid(), 'Kidal', v_ml),
      (gen_random_uuid(), 'Koutiala', v_ml),
      (gen_random_uuid(), 'San', v_ml)
    ON CONFLICT (nom, "paysId") DO NOTHING;
  END IF;

  -- Burkina Faso
  IF v_bf IS NOT NULL THEN
    INSERT INTO "GPOTB40" (id, nom, "paysId") VALUES
      (gen_random_uuid(), 'Ouagadougou', v_bf),
      (gen_random_uuid(), 'Bobo-Dioulasso', v_bf),
      (gen_random_uuid(), 'Koudougou', v_bf),
      (gen_random_uuid(), 'Ouahigouya', v_bf),
      (gen_random_uuid(), 'Banfora', v_bf),
      (gen_random_uuid(), 'Dédougou', v_bf),
      (gen_random_uuid(), 'Kaya', v_bf),
      (gen_random_uuid(), 'Tenkodogo', v_bf),
      (gen_random_uuid(), 'Fada N''Gourma', v_bf),
      (gen_random_uuid(), 'Gaoua', v_bf)
    ON CONFLICT (nom, "paysId") DO NOTHING;
  END IF;

  -- Madagascar
  IF v_mg IS NOT NULL THEN
    INSERT INTO "GPOTB40" (id, nom, "paysId") VALUES
      (gen_random_uuid(), 'Antananarivo', v_mg),
      (gen_random_uuid(), 'Toamasina', v_mg),
      (gen_random_uuid(), 'Antsirabe', v_mg),
      (gen_random_uuid(), 'Fianarantsoa', v_mg),
      (gen_random_uuid(), 'Mahajanga', v_mg),
      (gen_random_uuid(), 'Toliara', v_mg),
      (gen_random_uuid(), 'Antsiranana', v_mg),
      (gen_random_uuid(), 'Ambovombe', v_mg)
    ON CONFLICT (nom, "paysId") DO NOTHING;
  END IF;

  -- Sénégal
  IF v_sn IS NOT NULL THEN
    INSERT INTO "GPOTB40" (id, nom, "paysId") VALUES
      (gen_random_uuid(), 'Dakar', v_sn),
      (gen_random_uuid(), 'Thiès', v_sn),
      (gen_random_uuid(), 'Saint-Louis', v_sn),
      (gen_random_uuid(), 'Kaolack', v_sn),
      (gen_random_uuid(), 'Ziguinchor', v_sn),
      (gen_random_uuid(), 'Diourbel', v_sn),
      (gen_random_uuid(), 'Tambacounda', v_sn),
      (gen_random_uuid(), 'Kolda', v_sn)
    ON CONFLICT (nom, "paysId") DO NOTHING;
  END IF;

  -- Nigeria
  IF v_ng IS NOT NULL THEN
    INSERT INTO "GPOTB40" (id, nom, "paysId") VALUES
      (gen_random_uuid(), 'Lagos', v_ng),
      (gen_random_uuid(), 'Abuja', v_ng),
      (gen_random_uuid(), 'Kano', v_ng),
      (gen_random_uuid(), 'Ibadan', v_ng),
      (gen_random_uuid(), 'Benin City', v_ng),
      (gen_random_uuid(), 'Port Harcourt', v_ng),
      (gen_random_uuid(), 'Maiduguri', v_ng),
      (gen_random_uuid(), 'Zaria', v_ng),
      (gen_random_uuid(), 'Aba', v_ng),
      (gen_random_uuid(), 'Enugu', v_ng)
    ON CONFLICT (nom, "paysId") DO NOTHING;
  END IF;

  -- Ghana
  IF v_gh IS NOT NULL THEN
    INSERT INTO "GPOTB40" (id, nom, "paysId") VALUES
      (gen_random_uuid(), 'Accra', v_gh),
      (gen_random_uuid(), 'Kumasi', v_gh),
      (gen_random_uuid(), 'Tamale', v_gh),
      (gen_random_uuid(), 'Takoradi', v_gh),
      (gen_random_uuid(), 'Cape Coast', v_gh),
      (gen_random_uuid(), 'Sunyani', v_gh),
      (gen_random_uuid(), 'Ho', v_gh)
    ON CONFLICT (nom, "paysId") DO NOTHING;
  END IF;

  -- Kenya
  IF v_ke IS NOT NULL THEN
    INSERT INTO "GPOTB40" (id, nom, "paysId") VALUES
      (gen_random_uuid(), 'Nairobi', v_ke),
      (gen_random_uuid(), 'Mombasa', v_ke),
      (gen_random_uuid(), 'Kisumu', v_ke),
      (gen_random_uuid(), 'Nakuru', v_ke),
      (gen_random_uuid(), 'Eldoret', v_ke),
      (gen_random_uuid(), 'Thika', v_ke)
    ON CONFLICT (nom, "paysId") DO NOTHING;
  END IF;

  -- Uganda
  IF v_ug IS NOT NULL THEN
    INSERT INTO "GPOTB40" (id, nom, "paysId") VALUES
      (gen_random_uuid(), 'Kampala', v_ug),
      (gen_random_uuid(), 'Gulu', v_ug),
      (gen_random_uuid(), 'Mbarara', v_ug),
      (gen_random_uuid(), 'Jinja', v_ug),
      (gen_random_uuid(), 'Mbale', v_ug),
      (gen_random_uuid(), 'Entebbe', v_ug)
    ON CONFLICT (nom, "paysId") DO NOTHING;
  END IF;

END $$;
