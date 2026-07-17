import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import './AdminStyles.css';

export function CMSManager() {
  const [cmsData, setCmsData] = useState({
    hero: { title: '', subtitle: '', backgroundImage: '' },
    about: { heading: '', body: [''], imageSrc: '' },
    membershipPlans: { plans: [] },
    trainers: { items: [] },
    gallery: { items: [] },
    testimonials: { items: [] },
    branding: { gymName: '' },
    banners: [],          // promotional banner slider
    siteStatus: 'open',   // 'open' | 'closed'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const res = await axiosInstance.get('/cms');
        if (res.data.success && res.data.data) {
          const d = res.data.data;
          setCmsData({
            ...d,
            banners:    d.banners    ?? [],
            siteStatus: d.siteStatus ?? 'open',
          });
        }
      } catch (err) {
        console.error('Error fetching CMS:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCMS();
  }, []);

  const handleImageUpload = async (e, path) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await axiosInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        updateNestedField(path, res.data.url);
      }
    } catch (err) {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const updateNestedField = (path, value) => {
    const newCmsData = { ...cmsData };
    let current = newCmsData;
    const parts = path.split('.');
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setCmsData(newCmsData);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put('/cms', cmsData);
      alert('CMS updated successfully!');
    } catch (err) {
      alert('Failed to update CMS.');
    } finally {
      setSaving(false);
    }
  };

  const addArrayItem = (path, defaultItem) => {
    const newCmsData = { ...cmsData };
    let current = newCmsData;
    const parts = path.split('.');
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]].push(defaultItem);
    setCmsData(newCmsData);
  };

  const removeArrayItem = (path, index) => {
    const newCmsData = { ...cmsData };
    let current = newCmsData;
    const parts = path.split('.');
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]].splice(index, 1);
    setCmsData(newCmsData);
  };

  if (loading) return <div className="loading">Loading CMS data...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">CMS Manager</h1>
          <p className="dashboard-subtitle">Edit dynamic content for the marketing site.</p>
        </div>
        <div className="header-decoration">
          <div className="decoration-circle"></div>
        </div>
      </header>

      <div className="content-card">
        <div className="card-header">
          <div></div>
          <button className="btn-action btn-success" onClick={handleSave} disabled={saving || uploading}>
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        <div className="cms-sections">

        {/* ── BANNER SLIDER SECTION ── */}
        <div className="card">
          <div className="cms-section-header">
            <h2>Promotional Banners</h2>
            <button
              className="btn-action"
              onClick={() => addArrayItem('banners', {
                id: Date.now().toString(),
                title: 'Special Offer',
                subtitle: 'Limited time promotion',
                buttonText: '',
                buttonLink: '',
                imageSrc: '',
              })}
            >
              + Add Banner
            </button>
          </div>
          {(!cmsData.banners || cmsData.banners.length === 0) && (
            <p style={{ color: '#6b7280', fontSize: '0.9rem', padding: '8px 0' }}>
              No banners yet. Add one to display a slider on the homepage.
            </p>
          )}
          <div className="cms-grid">
            {(cmsData.banners ?? []).map((banner, index) => (
              <div key={banner.id || index} className="cms-item-card">
                <div className="form-group">
                  <label>Title</label>
                  <input value={banner.title ?? ''} onChange={(e) => {
                    const nb = [...cmsData.banners];
                    nb[index] = { ...nb[index], title: e.target.value };
                    updateNestedField('banners', nb);
                  }} />
                </div>
                <div className="form-group">
                  <label>Subtitle</label>
                  <input value={banner.subtitle ?? ''} onChange={(e) => {
                    const nb = [...cmsData.banners];
                    nb[index] = { ...nb[index], subtitle: e.target.value };
                    updateNestedField('banners', nb);
                  }} />
                </div>
                <div className="form-group">
                  <label>Button Text (optional)</label>
                  <input value={banner.buttonText ?? ''} onChange={(e) => {
                    const nb = [...cmsData.banners];
                    nb[index] = { ...nb[index], buttonText: e.target.value };
                    updateNestedField('banners', nb);
                  }} />
                </div>
                <div className="form-group">
                  <label>Button Link (optional)</label>
                  <input value={banner.buttonLink ?? ''} placeholder="#membership or https://..." onChange={(e) => {
                    const nb = [...cmsData.banners];
                    nb[index] = { ...nb[index], buttonLink: e.target.value };
                    updateNestedField('banners', nb);
                  }} />
                </div>
                <div className="form-group">
                  <label>Banner Image</label>
                  {banner.imageSrc && (
                    <img className="cms-preview" src={banner.imageSrc} alt={`Banner ${index + 1}`} />
                  )}
                  <input type="file" onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('image', file);
                    setUploading(true);
                    axiosInstance.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                      .then(res => {
                        const nb = [...cmsData.banners];
                        nb[index] = { ...nb[index], imageSrc: res.data.url };
                        updateNestedField('banners', nb);
                      })
                      .catch(() => alert('Banner image upload failed'))
                      .finally(() => setUploading(false));
                  }} />
                </div>
                <button className="btn-action btn-danger" onClick={() => removeArrayItem('banners', index)}>
                  Remove Banner
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="card">
          <div className="cms-section-header">
            <h2>Hero Section</h2>
          </div>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={cmsData.hero.title}
              onChange={(e) => updateNestedField('hero.title', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Subtitle</label>
            <textarea
              value={cmsData.hero.subtitle}
              onChange={(e) => updateNestedField('hero.subtitle', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Background Image</label>
            <div className="cms-upload-row">
              {cmsData.hero.backgroundImage && (
                <img className="cms-preview" src={cmsData.hero.backgroundImage} alt="Hero" />
              )}
              <input type="file" onChange={(e) => handleImageUpload(e, 'hero.backgroundImage')} />
            </div>
          </div>
        </div>

        {/* ABOUT SECTION */}
        <div className="card">
          <div className="cms-section-header">
            <h2>About Section</h2>
          </div>
          <div className="form-group">
            <label>Heading</label>
            <input
              type="text"
              value={cmsData.about.heading}
              onChange={(e) => updateNestedField('about.heading', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Description (Line 1)</label>
            <textarea
              value={cmsData.about.body[0]}
              onChange={(e) => {
                const newBody = [...cmsData.about.body];
                newBody[0] = e.target.value;
                updateNestedField('about.body', newBody);
              }}
            />
          </div>
          <div className="form-group">
            <label>Image</label>
            <div className="cms-upload-row">
              {cmsData.about.imageSrc && (
                <img className="cms-preview" src={cmsData.about.imageSrc} alt="About" />
              )}
              <input type="file" onChange={(e) => handleImageUpload(e, 'about.imageSrc')} />
            </div>
          </div>
        </div>

        {/* MEMBERSHIP PLANS */}
        <div className="card">
          <div className="cms-section-header">
            <h2>Membership Plans</h2>
            <button className="btn-action" onClick={() => addArrayItem('membershipPlans.plans', { id: Date.now(), name: '', price: '₹0', period: '/ month', features: [], highlighted: false })}>Add Plan</button>
          </div>
          {cmsData.membershipPlans.plans.map((plan, index) => (
            <div key={plan.id || index} className="cms-item-card">
              <div className="form-row">
                <div className="form-group">
                  <label>Plan Name</label>
                  <select 
                    value={plan.name} 
                    onChange={(e) => {
                      const newPlans = [...cmsData.membershipPlans.plans];
                      newPlans[index].name = e.target.value;
                      updateNestedField('membershipPlans.plans', newPlans);
                    }}
                  >
                    <option value="">Select Duration</option>
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="12 Months">12 Months</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input value={plan.price} onChange={(e) => {
                    const newPlans = [...cmsData.membershipPlans.plans];
                    newPlans[index].price = e.target.value;
                    updateNestedField('membershipPlans.plans', newPlans);
                  }} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={plan.description || ''} onChange={(e) => {
                  const newPlans = [...cmsData.membershipPlans.plans];
                  newPlans[index].description = e.target.value;
                  updateNestedField('membershipPlans.plans', newPlans);
                }} />
              </div>
              <div className="form-group">
                <label>Features (one per line)</label>
                <textarea value={(plan.features || []).join('\n')} onChange={(e) => {
                  const newPlans = [...cmsData.membershipPlans.plans];
                  newPlans[index].features = e.target.value.split('\n').filter(Boolean);
                  updateNestedField('membershipPlans.plans', newPlans);
                }} />
              </div>
              <button className="btn-action btn-danger" onClick={() => removeArrayItem('membershipPlans.plans', index)}>Remove Plan</button>
            </div>
          ))}
        </div>

        {/* TRAINERS */}
        <div className="card">
          <div className="cms-section-header">
            <h2>Trainers</h2>
            <button className="btn-action" onClick={() => addArrayItem('trainers.items', { id: Date.now().toString(), name: 'New Trainer', specialization: '', experience: '', imageSrc: '' })}>Add Trainer</button>
          </div>
          <div className="cms-grid">
            {cmsData.trainers.items.map((trainer, index) => (
              <div key={trainer.id || index} className="cms-item-card">
                <div className="form-group">
                  <label>Name</label>
                  <input value={trainer.name} onChange={(e) => {
                    const newItems = [...cmsData.trainers.items];
                    newItems[index].name = e.target.value;
                    updateNestedField('trainers.items', newItems);
                  }} />
                </div>
                <div className="form-group">
                  <label>Image</label>
                  {trainer.imageSrc && <img className="cms-preview" src={trainer.imageSrc} alt={trainer.name} />}
                  <input type="file" onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('image', file);
                    setUploading(true);
                    axiosInstance.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                      .then(res => {
                        const newItems = [...cmsData.trainers.items];
                        newItems[index].imageSrc = res.data.url;
                        updateNestedField('trainers.items', newItems);
                      })
                      .finally(() => setUploading(false));
                  }} />
                </div>
                <button className="btn-action btn-danger" onClick={() => removeArrayItem('trainers.items', index)}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        {/* GALLERY */}
        <div className="card">
          <div className="cms-section-header">
            <h2>Gallery</h2>
            <button className="btn-action" onClick={() => addArrayItem('gallery.items', { id: Date.now().toString(), src: '', alt: '', category: 'floor' })}>Add Image</button>
          </div>
          <div className="cms-grid">
            {cmsData.gallery.items.map((item, index) => (
              <div key={item.id || index} className="cms-item-card">
                <div className="form-group">
                  <label>Category</label>
                  <select value={item.category} onChange={(e) => {
                    const newItems = [...cmsData.gallery.items];
                    newItems[index].category = e.target.value;
                    updateNestedField('gallery.items', newItems);
                  }}>
                    <option value="floor">Training Floor</option>
                    <option value="studio">Studio</option>
                    <option value="recovery">Recovery</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Image</label>
                  {item.src && <img className="cms-preview" src={item.src} alt="Gallery" />}
                  <input type="file" onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('image', file);
                    setUploading(true);
                    axiosInstance.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                      .then(res => {
                        const newItems = [...cmsData.gallery.items];
                        newItems[index].src = res.data.url;
                        updateNestedField('gallery.items', newItems);
                      })
                      .finally(() => setUploading(false));
                  }} />
                </div>
                <button className="btn-action btn-danger" onClick={() => removeArrayItem('gallery.items', index)}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="card">
          <div className="cms-section-header">
            <h2>Testimonials</h2>
            <button className="btn-action" onClick={() => addArrayItem('testimonials.items', { id: Date.now().toString(), quote: '', name: '', role: '', ratingDisplay: '★★★★★' })}>Add Testimonial</button>
          </div>
          {cmsData.testimonials.items.map((item, index) => (
            <div key={item.id || index} className="cms-item-card">
              <div className="form-group">
                <label>Name</label>
                <input value={item.name} onChange={(e) => {
                  const newItems = [...cmsData.testimonials.items];
                  newItems[index].name = e.target.value;
                  updateNestedField('testimonials.items', newItems);
                }} />
              </div>
              <div className="form-group">
                <label>Quote</label>
                <textarea value={item.quote} onChange={(e) => {
                  const newItems = [...cmsData.testimonials.items];
                  newItems[index].quote = e.target.value;
                  updateNestedField('testimonials.items', newItems);
                }} />
              </div>
              <button className="btn-action btn-danger" onClick={() => removeArrayItem('testimonials.items', index)}>Remove</button>
            </div>
          ))}
        </div>

        {/* LOGO MANAGEMENT */}
        <div className="card">
          <div className="cms-section-header">
            <h2>Logo Management</h2>
          </div>
          
          <div className="form-group">
            <label>Logo Type</label>
            <select 
              value={cmsData.branding?.logo?.mode || 'text'} 
              onChange={(e) => updateNestedField('branding.logo.mode', e.target.value)}
            >
              <option value="image">Image Logo</option>
              <option value="text">Text Logo</option>
            </select>
          </div>

          {cmsData.branding?.logo?.mode === 'image' && (
            <div className="form-group">
              <label>Logo Image</label>
              <div className="cms-upload-row">
                {cmsData.branding.logo.imageSrc && (
                  <img 
                    className="cms-preview logo-preview" 
                    src={cmsData.branding.logo.imageSrc} 
                    alt="Logo Preview" 
                  />
                )}
                <input type="file" onChange={(e) => 
                  handleImageUpload(e, 'branding.logo.imageSrc')
                } />
                {cmsData.branding.logo.imageSrc && (
                  <button
                    className="btn-action btn-danger"
                    onClick={() => updateNestedField('branding.logo.imageSrc', '')}
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          )}

          {cmsData.branding?.logo?.mode === 'text' && (
            <>
              <div className="form-group">
                <label>Wordmark</label>
                <input
                  type="text"
                  value={cmsData.branding.logo.wordmark || ''}
                  onChange={(e) => updateNestedField('branding.logo.wordmark', e.target.value)}
                  placeholder="Main logo text (e.g. GYM)"
                />
              </div>
              
              <div className="form-group">
                <label>Tagline (Optional)</label>
                <input
                  type="text"
                  value={cmsData.branding.logo.tagline || ''}
                  onChange={(e) => updateNestedField('branding.logo.tagline', e.target.value)}
                  placeholder="Smaller secondary text"
                />
              </div>
            </>
          )}

        </div>

        {/* CONTACT SECTION */}
        <div className="card">
          <div className="cms-section-header">
            <h2>Contact Info</h2>
          </div>
          <div className="form-group">
            <label>Business Name</label>
            <input
              type="text"
              value={cmsData.branding.gymName}
              onChange={(e) => updateNestedField('branding.gymName', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
