'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminLayout from '../../../components/AdminLayout';
import { 
  Settings, 
  Save, 
  Clock, 
  Mail, 
  Shield, 
  Database,
  Bell,
  Globe,
  FileText,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SystemSettings {
  dureeEmpruntDefaut: number;
  nombreMaxEmprunts: number;
  dureeReservation: number;
  fraisRetard: number;
  emailNotifications: boolean;
  rappelsRetour: boolean;
  nombreJoursRappel: number;
  langue: string;
  timezone: string;
  sauvegardeAuto: boolean;
  frequenceSauvegarde: string;
}

export default function AdminParametresPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    dureeEmpruntDefaut: 14,
    nombreMaxEmprunts: 5,
    dureeReservation: 3,
    fraisRetard: 0.5,
    emailNotifications: true,
    rappelsRetour: true,
    nombreJoursRappel: 3,
    langue: 'fr',
    timezone: 'Europe/Paris',
    sauvegardeAuto: true,
    frequenceSauvegarde: 'quotidienne'
  });
  
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Paramètres sauvegardés avec succès');
      setHasChanges(false);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      dureeEmpruntDefaut: 14,
      nombreMaxEmprunts: 5,
      dureeReservation: 3,
      fraisRetard: 0.5,
      emailNotifications: true,
      rappelsRetour: true,
      nombreJoursRappel: 3,
      langue: 'fr',
      timezone: 'Europe/Paris',
      sauvegardeAuto: true,
      frequenceSauvegarde: 'quotidienne'
    });
    setHasChanges(true);
    toast('Paramètres réinitialisés aux valeurs par défaut', {
      icon: 'ℹ️'
    });
  };

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paramètres du Système</h1>
              <p className="mt-2 text-gray-600">Configurez les paramètres de votre bibliothèque</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Réinitialiser
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={!hasChanges || loading}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Paramètres d'emprunt */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Clock className="h-5 w-5 text-primary-600 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Paramètres d'Emprunt</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée d'emprunt par défaut (jours)
                    </label>
                    <input
                      type="number"
                      value={settings.dureeEmpruntDefaut}
                      onChange={(e) => handleInputChange('dureeEmpruntDefaut', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre maximum d'emprunts par utilisateur
                    </label>
                    <input
                      type="number"
                      value={settings.nombreMaxEmprunts}
                      onChange={(e) => handleInputChange('nombreMaxEmprunts', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée de réservation (jours)
                    </label>
                    <input
                      type="number"
                      value={settings.dureeReservation}
                      onChange={(e) => handleInputChange('dureeReservation', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frais de retard par jour (€)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.fraisRetard}
                      onChange={(e) => handleInputChange('fraisRetard', parseFloat(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Paramètres de notification */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Bell className="h-5 w-5 text-primary-600 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Notifications par email
                      </label>
                      <p className="text-xs text-gray-500">Envoyer des emails pour les emprunts/retours</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rappels de retour
                      </label>
                      <p className="text-xs text-gray-500">Rappeler aux utilisateurs de retourner les livres</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.rappelsRetour}
                        onChange={(e) => handleInputChange('rappelsRetour', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  {settings.rappelsRetour && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de jours avant échéance pour rappel
                      </label>
                      <input
                        type="number"
                        value={settings.nombreJoursRappel}
                        onChange={(e) => handleInputChange('nombreJoursRappel', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Paramètres généraux */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Globe className="h-5 w-5 text-primary-600 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Paramètres Généraux</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Langue par défaut
                    </label>
                    <select
                      value={settings.langue}
                      onChange={(e) => handleInputChange('langue', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuseau horaire
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                      <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                      <option value="Europe/London">Europe/London (GMT+0)</option>
                      <option value="America/New_York">America/New_York (GMT-5)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Paramètres de sauvegarde */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Database className="h-5 w-5 text-primary-600 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Sauvegarde</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Sauvegarde automatique
                      </label>
                      <p className="text-xs text-gray-500">Sauvegarder automatiquement les données</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.sauvegardeAuto}
                        onChange={(e) => handleInputChange('sauvegardeAuto', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  {settings.sauvegardeAuto && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fréquence de sauvegarde
                      </label>
                      <select
                        value={settings.frequenceSauvegarde}
                        onChange={(e) => handleInputChange('frequenceSauvegarde', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                      >
                        <option value="horaire">Toutes les heures</option>
                        <option value="quotidienne">Quotidienne</option>
                        <option value="hebdomadaire">Hebdomadaire</option>
                      </select>
                    </div>
                  )}
                  <div className="pt-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                      Créer une sauvegarde maintenant
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Actions Système</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Exporter les données</span>
                </button>
                <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Gérer les permissions</span>
                </button>
                <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Shield className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Logs de sécurité</span>
                </button>
              </div>
            </div>
          </div>

          {hasChanges && (
            <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg">
              <p className="text-sm">Vous avez des modifications non sauvegardées</p>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
